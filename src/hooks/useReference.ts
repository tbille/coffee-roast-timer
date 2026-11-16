/**
 * useReference — loads the roast followed as a reference ("Roast again").
 *
 * - A uuid: the public roast_profiles row (select works signed-out), converted with referenceFromRow.
 * - `local:<id>`: a draft kept on this device (roast_drafts:v1).
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDraft } from '@/lib/drafts';
import { deriveRoastFacts, type ProfileViewInput } from '@/utils/roastProfileView';
import { controlLabel } from '@/components/roast/console/model';
import type { RoastDraft, RoastReference } from '@/types/roast-session.types';
import type { RoastMilestone } from '@/types/roast.types';

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

export interface ReferenceRow extends ProfileViewInput {
  id: string;
  beans_name?: string | null;
  created_at?: string | null;
}

type Cue = RoastReference['cues'][number];

function sortCues(cues: Cue[]): Cue[] {
  const seen = new Set<string>();
  return cues
    .filter((c) => isNum(c.s) && c.s > 5 && c.label)
    .sort((a, b) => a.s - b.s)
    .filter((c) => {
      const key = `${Math.round(c.s)}-${c.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** Cues (and starting settings) from every storage generation of a roast row. */
function cuesFromRow(row: ReferenceRow): { cues: Cue[]; starting: Record<string, number | string> } {
  const data = asRecord(row.roaster_data);
  const settings = asRecord(row.roaster_settings);
  const starting: Record<string, number | string> = {};
  const cues: Cue[] = [];

  // Console (schema 2): { control, value, t(ms) }
  const v2 = [...asArray<Record<string, unknown>>(data.controlChanges), ...asArray<Record<string, unknown>>(settings.control_schedule)]
    .filter((c) => typeof c.control === 'string' && isNum(c.t) && (isNum(c.value) || typeof c.value === 'string'));
  for (const c of v2) cues.push({ s: (c.t as number) / 1000, label: controlLabel(c.control as string, c.value as number | string) });

  const savedStart = asRecord(
    data.startingSettings ?? asRecord(settings.starting_conditions).controls ?? settings.starting_settings,
  );
  for (const [k, v] of Object.entries(savedStart)) if (isNum(v) || typeof v === 'string') starting[k] = v;

  if (v2.length === 0) {
    // Legacy control_schedule: { time_seconds, heat_level, fan_level }
    for (const c of asArray<Record<string, unknown>>(settings.control_schedule)) {
      if (!isNum(c.time_seconds)) continue;
      const parts = [
        c.heat_level !== undefined && `Heat ${c.heat_level}${isNum(c.heat_level) && c.heat_level > 10 ? '%' : ''}`,
        c.fan_level !== undefined && `Fan ${c.fan_level}${isNum(c.fan_level) && c.fan_level > 10 ? '%' : ''}`,
      ].filter(Boolean);
      if (parts.length) cues.push({ s: c.time_seconds, label: parts.join(' · ') });
    }
    // FreshRoast
    asArray<Record<string, unknown>>(data.settingChanges).forEach((c, i) => {
      if (!isNum(c.time)) return;
      if (i === 0 && c.time <= 5) {
        if (isNum(c.heatLevel) || typeof c.heatLevel === 'string') starting.heat = c.heatLevel as number | string;
        if (isNum(c.fanSpeed) || typeof c.fanSpeed === 'string') starting.fan = c.fanSpeed as number | string;
        return;
      }
      cues.push({ s: c.time, label: `Heat ${c.heatLevel} · Fan ${c.fanSpeed}` });
    });
    // Behmor
    if (typeof data.profile === 'string') starting.program = data.profile;
    if (isNum(data.baseDuration) && data.baseDuration > 0) starting.lcd = data.baseDuration;
    if (typeof data.weightButton === 'string') starting.weight = data.weightButton;
    asArray<Record<string, unknown>>(data.extensions).forEach((e) => {
      if (isNum(e.time)) cues.push({ s: e.time, label: `+${isNum(e.duration) ? e.duration : 30} s` });
    });
    // Hottop (heat/fan %) and Behmor manual presses
    asArray<Record<string, unknown>>(data.manualControls).forEach((c, i) => {
      if (!isNum(c.time)) return;
      if (typeof c.setting === 'string') {
        cues.push({ s: c.time, label: c.setting === 'D' ? 'Drum speed (D)' : controlLabel('manual', c.setting) });
        return;
      }
      if (i === 0 && c.time <= 5) {
        if (isNum(c.heatPercent)) starting.heat = c.heatPercent;
        if (isNum(c.fanPercent)) starting.fan = c.fanPercent;
        return;
      }
      cues.push({ s: c.time, label: `Heat ${c.heatPercent}% · Fan ${c.fanPercent}%` });
    });
    // KALDI / manual
    asArray<Record<string, unknown>>(data.heatSettings).forEach((h) => {
      if (!isNum(h.time) || typeof h.setting !== 'string') return;
      if (h.time <= 5) {
        const m = h.setting.match(/^Flame (\d+)/);
        if (m) starting.flame = Number(m[1]);
        return;
      }
      cues.push({ s: h.time, label: h.setting });
    });
    // Gene setpoint changes (roaster_data temperatures are °C)
    let last: number | undefined;
    for (const p of asArray<Record<string, unknown>>(data.temperatureData)) {
      if (!isNum(p.time) || !isNum(p.targetTemp) || p.targetTemp <= 0) continue;
      if (last === undefined) starting.setpoint = p.targetTemp;
      else if (Math.abs(p.targetTemp - last) >= 1) cues.push({ s: p.time, label: controlLabel('setpoint', p.targetTemp) });
      last = p.targetTemp;
    }
  }
  return { cues: sortCues(cues), starting };
}

/** Converts a roast_profiles row into a reference. */
export function referenceFromRow(row: ReferenceRow): RoastReference {
  const facts = deriveRoastFacts(row);
  const data = asRecord(row.roaster_data);
  const events = asArray<{ type?: string; t?: number }>(data.events);
  const eventS = (type: string) => {
    const e = events.find((x) => x.type === type && isNum(x.t));
    return e ? (e.t as number) / 1000 : undefined;
  };
  const milestoneS = (type: string) => asArray<RoastMilestone>(row.milestones).find((m) => m.event_type === type)?.time_seconds;
  const yellowing = milestoneS('yellowing') ?? eventS('yellowing');
  const { cues, starting } = cuesFromRow(row);

  return {
    id: row.id,
    name: row.beans_name?.trim() || 'Untitled roast',
    roastedAt: row.created_at ?? undefined,
    roasterType: row.roaster_type ?? undefined,
    yellowingS: isNum(yellowing) && yellowing > 0 ? yellowing : undefined,
    firstCrackS: facts.firstCrack?.time,
    secondCrackS: facts.secondCrack?.time,
    dropS: facts.totalSeconds,
    cues,
    startingSettings: Object.keys(starting).length ? starting : undefined,
    batchGrams: isNum(row.initial_weight) && row.initial_weight > 0 ? row.initial_weight : undefined,
  };
}

/** Converts a draft kept on this device into a reference (id keeps the `local:` prefix). */
export function referenceFromDraft(draft: RoastDraft): RoastReference {
  const { result, details } = draft;
  const s = (type: string) => {
    const e = result.events.find((x) => x.type === type);
    return e ? e.t / 1000 : undefined;
  };
  return {
    id: `local:${result.id}`,
    name: details.beanName?.trim() || 'Roast on this device',
    roastedAt: new Date(result.chargedAt).toISOString(),
    roasterType: result.roasterType,
    yellowingS: s('yellowing'),
    firstCrackS: s('first_crack'),
    secondCrackS: s('second_crack'),
    dropS: s('drop') ?? result.durationSeconds,
    cues: sortCues(result.controlChanges.map((c) => ({ s: c.t / 1000, label: controlLabel(c.control, c.value) }))),
    startingSettings: result.startingSettings,
    batchGrams: details.weightInGrams ?? result.batchGrams,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface UseReferenceResult {
  reference: RoastReference | null;
  loading: boolean;
  error: string | null;
  clear: () => void;
}

export function useReference(refId?: string | null): UseReferenceResult {
  const [state, setState] = useState<{ id: string | null; reference: RoastReference | null; loading: boolean; error: string | null }>({
    id: null,
    reference: null,
    loading: false,
    error: null,
  });
  const [cleared, setCleared] = useState<string | null>(null);

  useEffect(() => {
    if (!refId) {
      setState({ id: null, reference: null, loading: false, error: null });
      return;
    }
    if (refId.startsWith('local:')) {
      const draft = getDraft(refId);
      setState({
        id: refId,
        reference: draft ? referenceFromDraft(draft) : null,
        loading: false,
        error: draft ? null : 'That roast is not on this device.',
      });
      return;
    }
    if (!UUID.test(refId)) {
      setState({ id: refId, reference: null, loading: false, error: 'That reference link is not valid.' });
      return;
    }
    let cancelled = false;
    setState({ id: refId, reference: null, loading: true, error: null });
    supabase
      .from('roast_profiles')
      .select('id, beans_name, created_at, roaster_type, duration_seconds, temperature_unit, crack_events, roaster_data, roaster_settings, milestones, initial_weight, final_weight')
      .eq('id', refId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setState({ id: refId, reference: null, loading: false, error: 'Could not load that roast.' });
          return;
        }
        setState({ id: refId, reference: referenceFromRow(data as unknown as ReferenceRow), loading: false, error: null });
      });
    return () => {
      cancelled = true;
    };
  }, [refId]);

  const clear = useCallback(() => setCleared(refId ?? null), [refId]);
  const isCleared = !!refId && cleared === refId;

  return {
    reference: isCleared || state.id !== (refId ?? null) ? null : state.reference,
    loading: !isCleared && state.loading,
    error: isCleared ? null : state.error,
    clear,
  };
}
