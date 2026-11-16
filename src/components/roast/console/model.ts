/**
 * Pure roast-console logic: the log shape, live phases, labels, and the
 * RoastResult (with the legacy mode-specific RoastData) built at Drop.
 *
 * Units: times are ms since Charge; temperatures are °C. Legacy RoastData uses
 * whole seconds, converted here.
 */
import type {
  ControlChange,
  RoastEvent,
  RoastEventType,
  RoastReference,
  RoastResult,
  TempReading,
} from '@/types/roast-session.types';
import type {
  BehmorProfile,
  CrackEvent,
  DualTempRoastData,
  HeatFanRoastData,
  HottopRoastData,
  ManualRoastData,
  PopcornPopperData,
  ProfileBasedRoastData,
  RoastData,
} from '@/types/roast-data.types';
import type { RoasterType } from '@/types/roaster.types';
import type { PhaseBarMarker, PhaseBarSegment } from '@/components/roast-card/PhaseBar';
import { formatSignedSeconds, formatTemp, msToSeconds, type TempUnit } from '@/lib/format';
import { BEHMOR_MANUAL_POWER, BEHMOR_PLUS_SECONDS, ROASTER_SPECS, type BehmorProgram } from '@/utils/roasterRegistry';

export const SCHEMA_VERSION = 2;

/** A reading counts for an event only if it is this recent. */
export const READING_MAX_AGE_MS = 30_000;

export type StartingSettings = Record<string, number | string>;

/** Popcorn popper colour cues (values match the legacy VisualCue.color vocabulary). */
export const COLOUR_CUES = [
  { value: 'light-brown', label: 'Light brown' },
  { value: 'medium-brown', label: 'Medium brown' },
  { value: 'dark-brown', label: 'Dark brown' },
] as const;

export interface ColourCue {
  t: number;
  color: string;
}

/** Order of things logged, so Undo removes the most recent one. */
export type HistoryEntry =
  | { kind: 'event'; type: RoastEventType; t: number }
  | { kind: 'control'; control: string; t: number }
  | { kind: 'reading'; t: number }
  | { kind: 'cue'; t: number }
  | { kind: 'skip'; t: number };

export interface ConsoleLog {
  /** Client UUID generated at Charge; becomes the saved roast id */
  id: string;
  roasterType: RoasterType | null;
  batchGrams: number;
  startingSettings: StartingSettings;
  /** Snapshot of the reference followed, so a reload does not need a refetch */
  reference: RoastReference | null;
  events: RoastEvent[];
  controlChanges: ControlChange[];
  readings: TempReading[];
  /** `t` values of readings that came from voice input (KALDI) */
  voiceReadings: number[];
  colourCues: ColourCue[];
  yellowingSkipped: boolean;
  history: HistoryEntry[];
}

export const EMPTY_LOG: ConsoleLog = {
  id: '',
  roasterType: null,
  batchGrams: 0,
  startingSettings: {},
  reference: null,
  events: [],
  controlChanges: [],
  readings: [],
  voiceReadings: [],
  colourCues: [],
  yellowingSkipped: false,
  history: [],
};

export const EVENT_LABELS: Record<RoastEventType, string> = {
  turning_point: 'Turning point',
  yellowing: 'Yellowing',
  first_crack: 'First crack',
  second_crack: 'Second crack',
  drop: 'Drop',
};

export function newRoastId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  // RFC 4122 v4 fallback for non-secure contexts
  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/* ------------------------------------------------------------------ */
/* Starting settings                                                   */
/* ------------------------------------------------------------------ */

export function defaultStartingSettings(type: RoasterType): StartingSettings {
  const spec = ROASTER_SPECS[type];
  const settings: StartingSettings = {};
  for (const control of spec.controls ?? []) settings[control.id] = control.default;
  if (type === 'behmor-2000ab') Object.assign(settings, { weight: '1/2 lb', program: 'P1', lcd: 12 * 60 });
  if (type === 'hottop-kn8828') settings.mode = 'manual';
  return settings;
}

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

/** "Heat 7", "Fan 40%", "Setpoint 240 °C", "+15 s", "−10 s", "Manual P3 (50%)" */
export function controlLabel(control: string, value: number | string, unit: TempUnit = 'C'): string {
  const spec = Object.values(ROASTER_SPECS)
    .flatMap((s) => s.controls ?? [])
    .find((c) => c.id === control);
  switch (control) {
    case 'setpoint':
      return typeof value === 'number' ? `Setpoint ${formatTemp(value, unit)}` : `Setpoint ${value}`;
    case 'extend':
      return typeof value === 'number' ? formatSignedSeconds(value) : `${value}`;
    case 'manual': {
      const power = BEHMOR_MANUAL_POWER[value as BehmorProgram];
      return power === undefined ? `Manual ${value}` : `Manual ${value} (${power}%)`;
    }
    case 'drum':
      return 'Drum speed (D)';
    case 'mode':
      return value === 'manual' ? 'Manual mode' : 'Auto mode';
    case 'program':
      return `Program ${value}`;
    default: {
      const label = spec?.label ?? control.charAt(0).toUpperCase() + control.slice(1);
      const suffix = spec?.unit === '%' && typeof value === 'number' ? '%' : '';
      return `${label} ${value}${suffix}`;
    }
  }
}

export function colourCueLabel(color: string): string {
  return COLOUR_CUES.find((c) => c.value === color)?.label ?? color;
}

/* ------------------------------------------------------------------ */
/* Live state                                                          */
/* ------------------------------------------------------------------ */

export const findEvent = (log: Pick<ConsoleLog, 'events'>, type: RoastEventType) =>
  log.events.find((e) => e.type === type);

/** The event the big button logs next. */
export function nextPrimaryEvent(log: ConsoleLog): RoastEventType {
  if (!findEvent(log, 'yellowing') && !log.yellowingSkipped && !findEvent(log, 'first_crack')) return 'yellowing';
  if (!findEvent(log, 'first_crack')) return 'first_crack';
  return 'drop';
}

export type LivePhaseKey = PhaseBarSegment['key'];

export const PHASE_LABELS: Record<LivePhaseKey, string> = {
  drying: 'Drying',
  maillard: 'Maillard',
  beforeCrack: 'Before first crack',
  development: 'Development',
};

/** Phase segments from real marks only. `endS` is the drop time or the live clock. */
export function livePhases(log: ConsoleLog, endS: number): PhaseBarSegment[] {
  const y = findEvent(log, 'yellowing');
  const fc = findEvent(log, 'first_crack');
  const ys = y ? y.t / 1000 : undefined;
  const fcs = fc ? fc.t / 1000 : undefined;
  const seg = (key: LivePhaseKey, start: number, end: number): PhaseBarSegment => ({
    key,
    label: PHASE_LABELS[key],
    start,
    end: Math.max(start, end),
  });

  if (fcs !== undefined) {
    const pre =
      ys !== undefined && ys < fcs
        ? [seg('drying', 0, ys), seg('maillard', ys, fcs)]
        : [seg('beforeCrack', 0, fcs)];
    return [...pre, seg('development', fcs, endS)];
  }
  if (ys !== undefined) return [seg('drying', 0, ys), seg('maillard', ys, endS)];
  if (log.yellowingSkipped) return [seg('beforeCrack', 0, endS)];
  return [seg('drying', 0, endS)];
}

/** Ticks drawn on the live bar for marks that are not phase boundaries. */
export function liveMarkers(log: ConsoleLog): PhaseBarMarker[] {
  return log.events
    .filter((e) => e.type === 'turning_point' || e.type === 'second_crack')
    .map((e) => ({ s: e.t / 1000, label: EVENT_LABELS[e.type] }));
}

export function referenceGhosts(reference: RoastReference | null | undefined): PhaseBarMarker[] {
  if (!reference) return [];
  const ghosts: PhaseBarMarker[] = [];
  if (reference.yellowingS) ghosts.push({ s: reference.yellowingS, label: 'Y' });
  if (reference.firstCrackS) ghosts.push({ s: reference.firstCrackS, label: 'FC' });
  if (reference.dropS) ghosts.push({ s: reference.dropS, label: 'Drop' });
  return ghosts;
}

/** Last reading taken at or before `t` and less than 30 s old. */
export function recentReading(readings: TempReading[], t: number): TempReading | undefined {
  let best: TempReading | undefined;
  for (const r of readings) {
    if (r.t <= t && t - r.t < READING_MAX_AGE_MS && (!best || r.t >= best.t)) best = r;
  }
  return best;
}

/** Current value of each control: last logged change, else the starting setting. */
export function currentControls(log: ConsoleLog): StartingSettings {
  const values: StartingSettings = { ...log.startingSettings };
  for (const change of [...log.controlChanges].sort((a, b) => a.t - b.t)) values[change.control] = change.value;
  return values;
}

/** Value of `control` in effect at time `t`. */
export function controlAt(log: ConsoleLog, control: string, t: number): number | string | undefined {
  let value = log.startingSettings[control];
  for (const change of [...log.controlChanges].sort((a, b) => a.t - b.t)) {
    if (change.t > t) break;
    if (change.control === control) value = change.value;
  }
  return value;
}

/* ------------------------------------------------------------------ */
/* Result                                                              */
/* ------------------------------------------------------------------ */

const sec = msToSeconds;
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

/** Events with `tempC` set from a reading under 30 s old (never from an input default). */
export function eventsWithTemps(log: ConsoleLog): RoastEvent[] {
  return [...log.events]
    .sort((a, b) => a.t - b.t)
    .map((e) => {
      const reading = recentReading(log.readings, e.t);
      const { tempC: _ignored, ...rest } = e;
      return reading ? { ...rest, tempC: reading.beanC } : rest;
    });
}

function crackEvents(log: ConsoleLog, chargedAt: number, withSetpoint: boolean): CrackEvent[] {
  return eventsWithTemps(log)
    .filter((e) => e.type === 'first_crack' || e.type === 'second_crack')
    .map((e) => {
      const crack: CrackEvent = {
        time: sec(e.t),
        type: e.type === 'first_crack' ? 'first' : 'second',
        timestamp: chargedAt + e.t,
      };
      if (e.tempC !== undefined) crack.currentTemp = e.tempC;
      const setpoint = withSetpoint ? num(controlAt(log, 'setpoint', e.t)) : undefined;
      if (setpoint !== undefined) crack.targetTemp = setpoint;
      return crack;
    });
}

const changesFor = (log: ConsoleLog, ...controls: string[]) =>
  [...log.controlChanges].filter((c) => controls.includes(c.control)).sort((a, b) => a.t - b.t);

/** Mode-specific legacy payload, shaped as the profile page already renders it. */
export function buildModeData(log: ConsoleLog, chargedAt: number, durationMs: number): RoastData {
  const base = {
    startTime: chargedAt,
    endTime: chargedAt + durationMs,
    schema_version: SCHEMA_VERSION,
  };
  const type = log.roasterType;
  const at = (t: number) => chargedAt + t;

  switch (type) {
    case 'gene-cbr-101': {
      const data: DualTempRoastData = {
        ...base,
        mode: 'dual-temperature',
        crackEvents: crackEvents(log, chargedAt, true),
        temperatureData: log.readings.map((r) => ({
          time: sec(r.t),
          targetTemp: num(controlAt(log, 'setpoint', r.t)) ?? 0,
          currentTemp: r.beanC,
          timestamp: at(r.t),
        })),
      };
      return data;
    }
    case 'behmor-2000ab': {
      const program = String(log.startingSettings.program ?? 'P1') as BehmorProfile;
      const data: ProfileBasedRoastData = {
        ...base,
        mode: 'profile-based',
        profile: program,
        baseDuration: num(log.startingSettings.lcd) ?? 0,
        weightButton: typeof log.startingSettings.weight === 'string' ? log.startingSettings.weight : undefined,
        extensions: changesFor(log, 'extend').map((c) => ({
          time: sec(c.t),
          // Signed: + presses are positive, − presses negative (seconds removed)
          duration: num(c.value) ?? BEHMOR_PLUS_SECONDS,
          timestamp: at(c.t),
        })),
        crackEvents: crackEvents(log, chargedAt, false),
      };
      const manual = changesFor(log, 'manual', 'drum').map((c) => ({
        time: sec(c.t),
        setting: c.control === 'drum' ? 'D' : String(c.value),
        timestamp: at(c.t),
      }));
      if (manual.length) data.manualControls = manual;
      if (log.readings.length) {
        data.temperatureData = log.readings.map((r) => ({ time: sec(r.t), temp: r.beanC, timestamp: at(r.t) }));
      }
      return data;
    }
    case 'freshroast-sr800':
    case 'freshroast-sr540': {
      const heat0 = num(log.startingSettings.heat) ?? 9;
      const fan0 = num(log.startingSettings.fan) ?? 5;
      const settingChanges = [{ time: 0, heatLevel: heat0, fanSpeed: fan0, timestamp: chargedAt }];
      for (const c of changesFor(log, 'heat', 'fan')) {
        settingChanges.push({
          time: sec(c.t),
          heatLevel: num(controlAt(log, 'heat', c.t)) ?? heat0,
          fanSpeed: num(controlAt(log, 'fan', c.t)) ?? fan0,
          timestamp: at(c.t),
        });
      }
      const data: HeatFanRoastData = {
        ...base,
        mode: 'heat-fan-control',
        settingChanges,
        crackEvents: crackEvents(log, chargedAt, false),
      };
      if (log.readings.length) {
        data.temperatureData = log.readings.map((r) => ({ time: sec(r.t), temp: r.beanC, timestamp: at(r.t) }));
      }
      return data;
    }
    case 'hottop-kn8828': {
      const startMode = log.startingSettings.mode === 'auto' ? 'auto' : 'manual';
      const usedManual = startMode === 'manual' || changesFor(log, 'mode').some((c) => c.value === 'manual');
      const snapshots: NonNullable<HottopRoastData['manualControls']> = [];
      if (startMode === 'manual') {
        snapshots.push({
          time: 0,
          heatPercent: num(log.startingSettings.heat) ?? 0,
          fanPercent: num(log.startingSettings.fan) ?? 0,
          timestamp: chargedAt,
        });
      }
      for (const c of changesFor(log, 'heat', 'fan')) {
        snapshots.push({
          time: sec(c.t),
          heatPercent: num(controlAt(log, 'heat', c.t)) ?? 0,
          fanPercent: num(controlAt(log, 'fan', c.t)) ?? 0,
          timestamp: at(c.t),
        });
      }
      const data: HottopRoastData = {
        ...base,
        mode: 'hottop-advanced',
        roastMode: startMode,
        crackEvents: crackEvents(log, chargedAt, false),
        temperatureData: log.readings.map((r) => ({
          time: sec(r.t),
          beanTemp: r.beanC,
          ...(r.envC !== undefined ? { environmentalTemp: r.envC } : {}),
          timestamp: at(r.t),
        })),
      };
      if (usedManual && snapshots.length) data.manualControls = snapshots;
      return data;
    }
    case 'popcorn-popper': {
      const data: PopcornPopperData = {
        ...base,
        mode: 'manual-simple',
        crackEvents: crackEvents(log, chargedAt, false),
      };
      if (log.readings.length) {
        data.temperatureData = log.readings.map((r) => ({
          time: sec(r.t),
          temp: r.beanC,
          recordMethod: 'manual' as const,
          timestamp: at(r.t),
        }));
      }
      if (log.colourCues.length) {
        data.visualCues = log.colourCues.map((c) => ({ time: sec(c.t), color: c.color, timestamp: at(c.t) }));
      }
      return data;
    }
    default: {
      // KALDI Wide and any manual roaster
      const flame0 = log.startingSettings.flame;
      const heatSettings = [
        ...(flame0 !== undefined ? [{ time: 0, setting: `Flame ${flame0}`, timestamp: chargedAt }] : []),
        ...changesFor(log, 'flame').map((c) => ({ time: sec(c.t), setting: `Flame ${c.value}`, timestamp: at(c.t) })),
      ];
      const data: ManualRoastData = {
        ...base,
        mode: 'manual-simple',
        crackEvents: crackEvents(log, chargedAt, false),
        temperatureData: log.readings.map((r) => ({
          time: sec(r.t),
          temp: r.beanC,
          recordMethod: log.voiceReadings.includes(r.t) ? ('voice' as const) : ('manual' as const),
          timestamp: at(r.t),
        })),
      };
      if (heatSettings.length) data.heatSettings = heatSettings;
      return data;
    }
  }
}

/** The RoastResult handed to the post-roast card. */
export function buildResult(log: ConsoleLog, chargedAt: number, durationMs: number): RoastResult {
  const drop = findEvent(log, 'drop');
  const totalMs = drop ? drop.t : durationMs;
  const startingSettings: StartingSettings = { ...log.startingSettings };
  return {
    id: log.id,
    roasterType: log.roasterType ?? 'custom',
    chargedAt,
    durationSeconds: sec(totalMs),
    batchGrams: log.batchGrams,
    events: eventsWithTemps(log),
    controlChanges: [...log.controlChanges].sort((a, b) => a.t - b.t),
    readings: [...log.readings].sort((a, b) => a.t - b.t),
    startingSettings,
    modeData: buildModeData(log, chargedAt, totalMs),
    ...(log.reference ? { referenceId: log.reference.id } : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Log display                                                         */
/* ------------------------------------------------------------------ */

export interface LogLine {
  key: string;
  t: number;
  text: string;
  kind: HistoryEntry['kind'];
}

export function logLines(log: ConsoleLog, unit: TempUnit): LogLine[] {
  const lines: LogLine[] = [
    ...log.events.map((e) => ({ key: `e-${e.type}`, t: e.t, text: EVENT_LABELS[e.type], kind: 'event' as const })),
    ...log.controlChanges.map((c, i) => ({
      key: `c-${i}-${c.t}`,
      t: c.t,
      text: controlLabel(c.control, c.value, unit),
      kind: 'control' as const,
    })),
    ...log.readings.map((r, i) => ({
      key: `r-${i}-${r.t}`,
      t: r.t,
      text: r.envC !== undefined ? `${formatTemp(r.beanC, unit)} · env ${formatTemp(r.envC, unit)}` : formatTemp(r.beanC, unit),
      kind: 'reading' as const,
    })),
    ...log.colourCues.map((c, i) => ({ key: `v-${i}-${c.t}`, t: c.t, text: colourCueLabel(c.color), kind: 'cue' as const })),
  ];
  if (log.yellowingSkipped) {
    const skip = log.history.find((h) => h.kind === 'skip');
    if (skip) lines.push({ key: 'skip', t: skip.t, text: 'Yellowing skipped', kind: 'skip' });
  }
  return lines.sort((a, b) => a.t - b.t);
}

/** Removes the most recent history entry and what it logged. Drop is undone separately. */
export function undoLast(log: ConsoleLog): ConsoleLog {
  const last = log.history[log.history.length - 1];
  if (!last) return log;
  const history = log.history.slice(0, -1);
  const dropLastMatch = <T,>(items: T[], match: (item: T) => boolean): T[] => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (match(items[i])) return [...items.slice(0, i), ...items.slice(i + 1)];
    }
    return items;
  };
  switch (last.kind) {
    case 'event':
      return { ...log, history, events: log.events.filter((e) => e.type !== last.type) };
    case 'control':
      return {
        ...log,
        history,
        controlChanges: dropLastMatch(log.controlChanges, (c) => c.control === last.control && c.t === last.t),
      };
    case 'reading':
      return {
        ...log,
        history,
        readings: dropLastMatch(log.readings, (r) => r.t === last.t),
        voiceReadings: log.voiceReadings.filter((t) => t !== last.t),
      };
    case 'cue':
      return { ...log, history, colourCues: dropLastMatch(log.colourCues, (c) => c.t === last.t) };
    case 'skip':
      return { ...log, history, yellowingSkipped: false };
  }
}

export function describeHistory(entry: HistoryEntry | undefined, log: ConsoleLog, unit: TempUnit): string | undefined {
  if (!entry) return undefined;
  switch (entry.kind) {
    case 'event':
      return EVENT_LABELS[entry.type];
    case 'control': {
      const change = log.controlChanges.find((c) => c.control === entry.control && c.t === entry.t);
      return change ? controlLabel(change.control, change.value, unit) : 'Control change';
    }
    case 'reading':
      return 'Temperature reading';
    case 'cue':
      return 'Colour';
    case 'skip':
      return 'Skip yellowing';
  }
}

/** Key (as produced by logLines) of the line the latest history entry created. */
export function undoLineKey(log: ConsoleLog): string | undefined {
  const last = log.history[log.history.length - 1];
  if (!last) return undefined;
  switch (last.kind) {
    case 'event':
      return `e-${last.type}`;
    case 'control': {
      const i = log.controlChanges.findIndex((c) => c.control === last.control && c.t === last.t);
      return i >= 0 ? `c-${i}-${last.t}` : undefined;
    }
    case 'reading': {
      const i = log.readings.findIndex((r) => r.t === last.t);
      return i >= 0 ? `r-${i}-${last.t}` : undefined;
    }
    case 'cue': {
      const i = log.colourCues.findIndex((c) => c.t === last.t);
      return i >= 0 ? `v-${i}-${last.t}` : undefined;
    }
    case 'skip':
      return 'skip';
  }
}
