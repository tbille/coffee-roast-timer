/**
 * Saves a roast draft to `roast_profiles` (DESIGN §4: existing columns, no migration).
 *
 * - `id` is the draft's client UUID, so saving twice is harmless: a unique
 *   violation (23505) means the row is already there.
 * - All temperatures are stored in °C (`temperature_unit: 'C'`).
 * - Legacy columns (`crack_events`, `temperature_data`) are filled so the
 *   existing profile page and Discover keep rendering new rows.
 */
import { supabase } from '@/integrations/supabase/client';
import type { Json, TablesInsert } from '@/integrations/supabase/types';
import { listUnsyncedDrafts, markSynced, getDraft, isDirty } from '@/lib/drafts';
import { normaliseOrigin } from '@/lib/origins';
import { msToSeconds } from '@/lib/format';
import {
  PLACE_LABELS,
  PROCESS_LABELS,
  type ControlChange,
  type RoastDraft,
  type RoastEvent,
  type RoastEventType,
} from '@/types/roast-session.types';

export const ROAST_SCHEMA_VERSION = 2;

/** Name stored when the bean was left blank (the column is NOT NULL). */
export const UNNAMED_BEAN = 'Unnamed bean';

export type SaveRoastResult =
  | { ok: true; id: string; alreadySaved: boolean }
  | { ok: false; error: string; code?: string };

type RoastProfileInsert = TablesInsert<'roast_profiles'>;

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
const toS = msToSeconds;

/** Event of a type, last one wins (a re-mark replaces the earlier tap). */
export function findEvent(events: RoastEvent[], type: RoastEventType): RoastEvent | undefined {
  for (let i = events.length - 1; i >= 0; i--) if (events[i].type === type) return events[i];
  return undefined;
}

/** "Garage · 14 °C", trimmed to the 200-char column limit. */
export function environmentalNotes(draft: RoastDraft): string | null {
  const { place, ambientC } = draft.details;
  const parts = [place ? PLACE_LABELS[place] : undefined, isNum(ambientC) ? `${Math.round(ambientC * 10) / 10} °C` : undefined]
    .filter(Boolean) as string[];
  if (parts.length === 0) return null;
  return parts.join(' · ').slice(0, 200);
}

export interface DevelopmentStatsRow {
  first_crack_time_seconds?: number;
  development_time_seconds?: number;
  development_ratio_percent?: number;
  time_to_first_crack_seconds?: number;
}

export function developmentStats(draft: RoastDraft): DevelopmentStatsRow | null {
  const total = Math.round(draft.result.durationSeconds);
  const fc = findEvent(draft.result.events, 'first_crack');
  if (!fc || total <= 0) return null;
  const fcS = toS(fc.t);
  if (fcS <= 0 || fcS >= total) return { first_crack_time_seconds: fcS, time_to_first_crack_seconds: fcS };
  const dev = total - fcS;
  return {
    first_crack_time_seconds: fcS,
    time_to_first_crack_seconds: fcS,
    development_time_seconds: dev,
    development_ratio_percent: Math.round((dev / total) * 1000) / 10,
  };
}

const MILESTONE_TYPE: Record<RoastEventType, { event_type: string; label?: string }> = {
  turning_point: { event_type: 'custom', label: 'Turning point' },
  yellowing: { event_type: 'yellowing' },
  first_crack: { event_type: 'first_crack' },
  second_crack: { event_type: 'second_crack' },
  drop: { event_type: 'drop' },
};

export function milestones(draft: RoastDraft) {
  const order: RoastEventType[] = ['turning_point', 'yellowing', 'first_crack', 'second_crack', 'drop'];
  return order.flatMap((type) => {
    const e = findEvent(draft.result.events, type);
    if (!e) return [];
    const m = MILESTONE_TYPE[type];
    return [{ time_seconds: toS(e.t), event_type: m.event_type, ...(m.label ? { label: m.label } : {}) }];
  });
}

/** Legacy `crack_events`: `{ type, time, currentTemp?, timestamp }`, seconds since charge. */
export function crackEvents(draft: RoastDraft) {
  const { events, chargedAt } = draft.result;
  return (['first_crack', 'second_crack'] as const).flatMap((type) => {
    const e = findEvent(events, type);
    if (!e) return [];
    return [{
      type: type === 'first_crack' ? 'first' as const : 'second' as const,
      time: toS(e.t),
      ...(isNum(e.tempC) ? { currentTemp: e.tempC } : {}),
      timestamp: chargedAt + e.t,
    }];
  });
}

/** Legacy `temperature_data`: only for Gene / dual-temperature roasts, °C. */
export function legacyTemperatureData(draft: RoastDraft) {
  const { modeData, readings, chargedAt } = draft.result;
  const data = modeData as unknown as { mode?: string; temperatureData?: unknown };
  if (data?.mode !== 'dual-temperature') return [];
  const fromMode = Array.isArray(data.temperatureData)
    ? (data.temperatureData as Array<Record<string, unknown>>)
        .filter((p) => isNum(p.time) && isNum(p.currentTemp))
        .map((p) => ({
          time: p.time as number,
          targetTemp: isNum(p.targetTemp) ? p.targetTemp : (p.currentTemp as number),
          currentTemp: p.currentTemp as number,
          timestamp: isNum(p.timestamp) ? p.timestamp : chargedAt + (p.time as number) * 1000,
        }))
    : [];
  if (fromMode.length > 0) return fromMode;
  return readings
    .filter((r) => isNum(r.beanC))
    .map((r) => ({ time: toS(r.t), targetTemp: isNum(r.envC) ? r.envC : r.beanC, currentTemp: r.beanC, timestamp: chargedAt + r.t }));
}

/**
 * `roaster_settings.control_schedule` in the shape the profile page already
 * reads (`{ time_seconds, heat_level?, fan_level?, note? }`), with the raw
 * `{ control, value, t }` kept on each entry. Setpoints go to `temperature_schedule`.
 */
function schedules(draft: RoastDraft) {
  const { controlChanges, startingSettings, roasterType, modeData } = draft.result;
  const percent = roasterType === 'hottop-kn8828';
  const profileBased = (modeData as unknown as { mode?: string })?.mode === 'profile-based';
  const level = (v: number | string) => (percent && isNum(v) ? v : String(v));

  const all: ControlChange[] = [
    ...Object.entries(startingSettings ?? {}).map(([control, value]) => ({ control, value, t: 0 })),
    ...controlChanges,
  ];

  const control_schedule: Array<Record<string, unknown>> = [];
  const temperature_schedule: Array<Record<string, unknown>> = [];
  for (const c of all) {
    const time_seconds = toS(c.t);
    if (c.control === 'setpoint' && isNum(c.value)) {
      temperature_schedule.push({ time_seconds, target_temp_c: c.value, control: c.control, value: c.value, t: c.t });
      continue;
    }
    // Behmor program/extensions are rendered from roaster_data already.
    if (profileBased && (c.control === 'extend' || c.control === 'program')) continue;
    const entry: Record<string, unknown> = { time_seconds, control: c.control, value: c.value, t: c.t };
    if (c.control === 'heat') entry.heat_level = level(c.value);
    else if (c.control === 'fan') entry.fan_level = level(c.value);
    else entry.note = `${c.control.charAt(0).toUpperCase()}${c.control.slice(1)} ${c.value}`;
    // Merge same-second heat + fan taps (e.g. the starting settings) into one step.
    const prev = control_schedule[control_schedule.length - 1];
    if (prev && prev.time_seconds === time_seconds && !prev.note && !entry.note
      && ((entry.heat_level !== undefined && prev.heat_level === undefined) || (entry.fan_level !== undefined && prev.fan_level === undefined))) {
      Object.assign(prev, { ...entry, control: prev.control, value: prev.value, t: prev.t, also: { control: c.control, value: c.value, t: c.t } });
      continue;
    }
    control_schedule.push(entry);
  }
  return { control_schedule, temperature_schedule };
}

export function roasterSettings(draft: RoastDraft) {
  const { details, result } = draft;
  const { control_schedule, temperature_schedule } = schedules(draft);
  return {
    schema_version: ROAST_SCHEMA_VERSION,
    roast_level: details.roastLevel ?? null,
    process: details.process ?? null,
    environment: details.place ?? null,
    ambient_c: isNum(details.ambientC) ? details.ambientC : null,
    control_schedule,
    ...(temperature_schedule.length > 0 ? { temperature_schedule } : {}),
    starting_conditions: {
      ...(isNum(details.ambientC) ? { room_temp_c: details.ambientC } : {}),
      controls: result.startingSettings ?? {},
      batch_grams: result.batchGrams,
    },
    ...(result.referenceId ? { reference_id: result.referenceId } : {}),
  };
}

/** The full insert payload for a draft. Pure; exported for tests and export. */
export function buildRoastRow(draft: RoastDraft, userId: string): RoastProfileInsert {
  const { result, details } = draft;
  const crack = crackEvents(draft);
  const weightIn = isNum(details.weightInGrams) && details.weightInGrams > 0 ? details.weightInGrams : result.batchGrams > 0 ? result.batchGrams : null;
  const weightOut = isNum(details.weightOutGrams) && details.weightOutGrams > 0 ? details.weightOutGrams : null;
  const drop = findEvent(result.events, 'drop');

  const roasterData = {
    ...(result.modeData as unknown as Record<string, unknown>),
    // Edited crack times win over what the mode recorded live.
    crackEvents: crack,
    ...(drop ? { endTime: result.chargedAt + drop.t } : {}),
    events: result.events,
    controlChanges: result.controlChanges,
    readings: result.readings,
    schema_version: ROAST_SCHEMA_VERSION,
  };

  return {
    id: result.id,
    user_id: userId,
    roaster_type: result.roasterType,
    duration_seconds: Math.max(0, Math.round(result.durationSeconds)),
    initial_weight: weightIn,
    final_weight: weightOut,
    beans_name: details.beanName?.trim() || UNNAMED_BEAN,
    origin: normaliseOrigin(details.origin) || null,
    farm_name: details.farm?.trim() || null,
    notes: details.notes?.trim() || null,
    environmental_notes: environmentalNotes(draft),
    roast_process: details.process ? PROCESS_LABELS[details.process] : null,
    temperature_unit: 'C',
    roaster_settings: roasterSettings(draft) as unknown as Json,
    milestones: milestones(draft) as unknown as Json,
    development_stats: developmentStats(draft) as unknown as Json,
    crack_events: crack as unknown as Json,
    temperature_data: legacyTemperatureData(draft) as unknown as Json,
    roaster_data: roasterData as unknown as Json,
    created_at: new Date(result.chargedAt).toISOString(),
  };
}

const errorMessage = (e: unknown) =>
  e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Unknown error';

/**
 * Inserts the draft; a duplicate id counts as saved. When the local draft was
 * edited after its last sync, the existing row is updated instead.
 * Marks the draft synced on success.
 */
export async function saveRoast(draft: RoastDraft, userId: string): Promise<SaveRoastResult> {
  const row = buildRoastRow(draft, userId);
  try {
    const { error } = await supabase.from('roast_profiles').insert(row);
    if (!error) {
      markSynced(draft.result.id);
      return { ok: true, id: row.id!, alreadySaved: false };
    }
    if (error.code !== '23505') return { ok: false, error: error.message, code: error.code };

    // Already in the account. Push later edits (never touch created_at / user_id).
    const stored = getDraft(draft.result.id) ?? draft;
    if (draft.syncedAt === undefined || isDirty(stored)) {
      const changes: Partial<RoastProfileInsert> = { ...row };
      delete changes.id;
      delete changes.user_id;
      delete changes.created_at;
      const { error: updateError } = await supabase
        .from('roast_profiles')
        .update(changes)
        .eq('id', row.id!)
        .eq('user_id', userId);
      if (updateError) return { ok: false, error: updateError.message, code: updateError.code };
    }
    markSynced(draft.result.id);
    return { ok: true, id: row.id!, alreadySaved: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

let syncing: Promise<{ saved: number; failed: number }> | null = null;

/** Saves every unsynced draft on this device to the account. Safe to call repeatedly. */
export function syncPendingDrafts(userId: string): Promise<{ saved: number; failed: number }> {
  if (syncing) return syncing;
  syncing = (async () => {
    let saved = 0;
    let failed = 0;
    for (const draft of listUnsyncedDrafts()) {
      const res = await saveRoast(draft, userId);
      if (res.ok) saved++;
      else failed++;
    }
    return { saved, failed };
  })().finally(() => {
    syncing = null;
  });
  return syncing;
}
