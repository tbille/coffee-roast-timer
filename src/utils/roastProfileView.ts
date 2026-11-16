/**
 * Derives everything the roast pages display from a stored roast_profiles row.
 *
 * Rules:
 * - Facts only: only real, recorded data is turned into facts, phases and steps.
 *   Nothing is estimated and nothing is judged.
 * - Data from every storage generation is supported:
 *   - legacy columns (temperature_data, crack_events),
 *   - mode-specific roaster_data (crackEvents, temperatureData, settingChanges, profile/extensions…),
 *   - schema v2 written by the redesigned console (roaster_data.schema_version = 2 with
 *     events / controlChanges / readings in ms, milestones, roaster_settings v2 with
 *     roast_level / process / environment / ambient_c / control_schedule).
 *
 * Legacy heuristics (documented here, applied at display time only, never written back):
 * - Gene °F rows (REPORT S1): before the redesign the Gene mode converted readings to °C
 *   but saved `temperature_unit: 'F'`. A genuine °F roast always records values well above
 *   300 (first crack is ~380–400 °F), while those mislabelled rows top out around 260.
 *   So: a non-v2 row labelled 'F' whose every recorded temperature (bean, setpoint and
 *   crack temps) is below 300 is read as °C. See `storedTempUnit`.
 * - "Roast level/process" (REPORT S3): the old save dialog had one free-text field, so
 *   `roast_process` sometimes holds a roast level ("Full City", "City+", "Medium",
 *   "Dark Roast", "Light to Medium") or a temperature ("240°"). For rows without a v2
 *   `roaster_settings.process`, such values are shown as the roast level (verbatim,
 *   tidied), never as a process. Detection is conservative: every word must be a
 *   roast-level word. See `looksLikeRoastLevel` / `looksLikeTemperature`.
 */

import { convertTemperature, type TemperatureUnit } from "@/utils/temperatureConversion";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import { tidyLabel } from "@/utils/textDisplay";
import { normaliseOrigin } from "@/lib/origins";
import { formatClock as formatClockBase } from "@/lib/format";
import type { RoasterType } from "@/types/roaster.types";
import type { RoastMilestone, RoasterSettings } from "@/types/roast.types";
import {
  PLACE_LABELS,
  PROCESS_LABELS,
  ROAST_LEVEL_LABELS,
  type ProcessMethod,
  type RoastLevel,
  type RoastPlace,
} from "@/types/roast-session.types";
import type { RoastCardData } from "@/components/roast-card/RoastCard";

/** Loose shape of a profile row: every field the view reads, all optional. */
export interface ProfileViewInput {
  duration_seconds: number;
  roaster_type?: RoasterType | string | null;
  temperature_unit?: TemperatureUnit | string | null;
  temperature_data?: Array<{ time: number; targetTemp?: number | null; currentTemp?: number | null }> | null;
  crack_events?: Array<{ time: number; type: "first" | "second"; currentTemp?: number | null; timestamp?: number }> | null;
  roaster_data?: Record<string, unknown> | null;
  milestones?: RoastMilestone[] | Array<Record<string, unknown>> | null;
  roaster_settings?: RoasterSettings | Record<string, unknown> | null;
  initial_weight?: number | null;
  final_weight?: number | null;
}

/** Row fields used for card / page labels on top of the view input. */
export interface ProfileRowInput extends ProfileViewInput {
  id: string;
  beans_name?: string | null;
  origin?: string | null;
  farm_name?: string | null;
  roast_process?: string | null;
  coffee_roaster?: string | null;
  environmental_notes?: string | null;
  created_at: string;
  /** Either a number or the PostgREST aggregate `likes:roast_profile_likes(count)` */
  likes?: number | Array<{ count: number }> | null;
}

export interface CrackFact {
  time: number;
  /** In the profile's effective stored unit (see `storedTempUnit`) */
  temp?: number;
}

export interface RoastFacts {
  totalSeconds: number;
  /** Yellowing time in seconds when it was marked */
  yellowing?: number;
  firstCrack?: CrackFact;
  secondCrack?: CrackFact;
  developmentSeconds?: number;
  developmentPercent?: number;
  weightIn?: number;
  weightOut?: number;
  weightLossPercent?: number;
}

export type PhaseKey = "drying" | "maillard" | "beforeCrack" | "development";

export interface RoastPhase {
  key: PhaseKey;
  label: string;
  start: number;
  end: number;
  percent: number;
}

export type StepKind = "start" | "setting" | "extension" | "milestone" | "first_crack" | "second_crack" | "drop";

export interface RoastStep {
  time: number;
  kind: StepKind;
  title: string;
  /** Settings or values to apply, shown as chips */
  values?: string[];
  detail?: string;
}

export interface ChartPoint {
  /** Seconds since charge */
  time: number;
  bean?: number;
  /** Setpoint / environment temperature */
  setpoint?: number;
}

/** A marked moment, for chart reference lines and timelines. Seconds since charge. */
export interface RoastEventMark {
  kind: "turning_point" | "yellowing" | "first_crack" | "second_crack" | "drop";
  s: number;
  label: string;
  short: string;
}

export interface BatchCheck {
  min: number;
  max: number;
  status: "below" | "within" | "above";
}

/** Seconds → "m:ss". Re-exported for older imports; prefer `@/lib/format`. */
export const formatClock = (seconds: number): string => formatClockBase(seconds);

const round1 = (n: number) => Math.round(n * 10) / 10;

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const roasterData = (p: ProfileViewInput) => asRecord(p.roaster_data);
const settingsOf = (p: ProfileViewInput) => asRecord(p.roaster_settings);

/** True for rows written by the redesigned console (roaster_data or roaster_settings v2). */
export function isSchemaV2(p: ProfileViewInput): boolean {
  return roasterData(p).schema_version === 2 || settingsOf(p).schema_version === 2;
}

// ---------------------------------------------------------------------------
// Temperatures

interface V2Reading { t: number; beanC?: number; envC?: number }
interface V2Event { type: string; t: number; tempC?: number }
interface V2Control { control: string; value: number | string; t: number }

const v2Readings = (p: ProfileViewInput) =>
  asArray<V2Reading>(roasterData(p).readings).filter((r) => r && isNum(r.t) && (isNum(r.beanC) || isNum(r.envC)));
const v2Events = (p: ProfileViewInput) =>
  asArray<V2Event>(roasterData(p).events).filter((e) => e && typeof e.type === "string" && isNum(e.t));

/**
 * The unit the row's temperatures are really stored in.
 * v2 rows are always °C. Legacy rows labelled 'F' whose values never reach 300 are
 * the mislabelled Gene rows from REPORT S1 and are read as °C.
 */
export function storedTempUnit(p: ProfileViewInput): TemperatureUnit {
  if (p.temperature_unit !== "F") return "C";
  if (isSchemaV2(p)) return "C";
  const values: number[] = [];
  asArray<{ currentTemp?: number | null; targetTemp?: number | null }>(p.temperature_data).forEach((d) => {
    if (isNum(d?.currentTemp) && d.currentTemp > 0) values.push(d.currentTemp);
    if (isNum(d?.targetTemp) && d.targetTemp > 0) values.push(d.targetTemp);
  });
  asArray<{ currentTemp?: number | null; targetTemp?: number | null }>(p.crack_events).forEach((c) => {
    if (isNum(c?.currentTemp) && c.currentTemp > 0) values.push(c.currentTemp);
    if (isNum(c?.targetTemp) && c.targetTemp > 0) values.push(c.targetTemp);
  });
  if (values.length > 0 && Math.max(...values) < 300) return "C";
  return "F";
}

const toUnit = (value: number, from: TemperatureUnit, to: TemperatureUnit) => round1(convertTemperature(value, from, to));

// ---------------------------------------------------------------------------
// Facts

function crackEvents(p: ProfileViewInput) {
  const legacy = asArray<{ time: number; type: "first" | "second"; currentTemp?: number | null }>(p.crack_events);
  const source = legacy.length > 0 ? legacy : asArray<typeof legacy[number]>(roasterData(p).crackEvents);
  return source.filter((e) => e && isNum(e.time) && (e.type === "first" || e.type === "second"));
}

const milestonesOf = (p: ProfileViewInput) =>
  asArray<RoastMilestone>(p.milestones).filter((m) => m && typeof m.event_type === "string" && isNum(m.time_seconds));

/** Event time in seconds from v2 events (ms), with its °C temperature. */
function v2EventS(p: ProfileViewInput, type: string): { s: number; tempC?: number } | undefined {
  const e = v2Events(p).find((ev) => ev.type === type);
  if (!e) return undefined;
  return { s: e.t / 1000, tempC: isNum(e.tempC) && e.tempC > 0 ? e.tempC : undefined };
}

function findCrack(p: ProfileViewInput, type: "first" | "second"): CrackFact | undefined {
  const milestoneType = type === "first" ? "first_crack" : "second_crack";
  const legacyEvent = crackEvents(p).find((e) => e.type === type);
  const legacyTemp = legacyEvent && isNum(legacyEvent.currentTemp) && legacyEvent.currentTemp > 0 ? legacyEvent.currentTemp : undefined;
  const v2 = v2EventS(p, milestoneType);
  // v2 temperatures are °C; for v2 rows the effective unit is °C as well.
  const temp = v2?.tempC ?? legacyTemp;

  const milestone = milestonesOf(p).find((m) => m.event_type === milestoneType);
  if (milestone) return { time: milestone.time_seconds, temp };
  if (legacyEvent) return { time: legacyEvent.time, temp: legacyTemp };
  if (v2) return { time: Math.round(v2.s), temp: v2.tempC };
  return undefined;
}

function findYellowing(p: ProfileViewInput): number | undefined {
  const m = milestonesOf(p).find((x) => x.event_type === "yellowing");
  if (m) return m.time_seconds;
  const e = v2EventS(p, "yellowing");
  return e ? Math.round(e.s) : undefined;
}

export function deriveRoastFacts(p: ProfileViewInput): RoastFacts {
  const totalSeconds = Math.max(0, p.duration_seconds || 0);
  const firstCrack = findCrack(p, "first");
  const secondCrackRaw = findCrack(p, "second");
  const validFirstCrack = firstCrack && firstCrack.time > 0 && firstCrack.time < totalSeconds ? firstCrack : undefined;
  const secondCrack =
    secondCrackRaw && secondCrackRaw.time <= totalSeconds && (!validFirstCrack || secondCrackRaw.time > validFirstCrack.time)
      ? secondCrackRaw
      : undefined;
  const yellowingRaw = findYellowing(p);
  const yellowing =
    isNum(yellowingRaw) && yellowingRaw > 0 && yellowingRaw < (validFirstCrack?.time ?? totalSeconds) ? yellowingRaw : undefined;

  const facts: RoastFacts = { totalSeconds, yellowing, firstCrack: validFirstCrack, secondCrack };

  if (validFirstCrack && totalSeconds > 0) {
    facts.developmentSeconds = totalSeconds - validFirstCrack.time;
    facts.developmentPercent = (facts.developmentSeconds / totalSeconds) * 100;
  }

  const weightIn = isNum(p.initial_weight) && p.initial_weight > 0 ? p.initial_weight : undefined;
  const weightOut = isNum(p.final_weight) && p.final_weight > 0 ? p.final_weight : undefined;
  facts.weightIn = weightIn;
  facts.weightOut = weightOut;
  if (weightIn && weightOut && weightOut < weightIn) {
    facts.weightLossPercent = ((weightIn - weightOut) / weightIn) * 100;
  }

  return facts;
}

/**
 * Whether a roast's numbers are plausible enough to feed community aggregates
 * (medians, ranges). Outliers are only excluded from aggregates, never flagged on cards.
 * Dev % outside 3–50 or weight loss outside 5–30 % are excluded.
 */
export function isPlausibleForAggregates(facts: RoastFacts): boolean {
  if (facts.developmentPercent !== undefined && (facts.developmentPercent < 3 || facts.developmentPercent > 50)) return false;
  if (facts.weightLossPercent !== undefined && (facts.weightLossPercent < 5 || facts.weightLossPercent > 30)) return false;
  return true;
}

/**
 * Roast phases from recorded events only. Drying/Maillard are split only when a
 * real yellowing mark exists; otherwise the pre-crack period is one phase.
 */
export function deriveRoastPhases(p: ProfileViewInput, facts: RoastFacts): RoastPhase[] {
  const total = facts.totalSeconds;
  if (!total) return [];
  const fc = facts.firstCrack?.time;
  const yellowing = facts.yellowing ?? findYellowing(p);
  const pct = (a: number, b: number) => ((b - a) / total) * 100;

  if (!fc) return [];

  const phases: RoastPhase[] = [];
  if (isNum(yellowing) && yellowing > 0 && yellowing < fc) {
    phases.push({ key: "drying", label: "Drying", start: 0, end: yellowing, percent: pct(0, yellowing) });
    phases.push({ key: "maillard", label: "Maillard", start: yellowing, end: fc, percent: pct(yellowing, fc) });
  } else {
    phases.push({ key: "beforeCrack", label: "To first crack", start: 0, end: fc, percent: pct(0, fc) });
  }
  phases.push({ key: "development", label: "Development", start: fc, end: total, percent: pct(fc, total) });
  return phases;
}

/** Marked moments (turning point, yellowing, cracks, drop) in seconds, sorted. */
export function deriveEventMarks(p: ProfileViewInput, facts: RoastFacts = deriveRoastFacts(p)): RoastEventMark[] {
  const marks: RoastEventMark[] = [];
  const tp = milestonesOf(p).find((m) => m.event_type === "custom" && /turning/i.test(m.label ?? ""))?.time_seconds
    ?? v2EventS(p, "turning_point")?.s;
  if (isNum(tp) && tp > 0) marks.push({ kind: "turning_point", s: Math.round(tp), label: "Turning point", short: "TP" });
  if (facts.yellowing !== undefined) marks.push({ kind: "yellowing", s: facts.yellowing, label: "Yellowing", short: "Y" });
  if (facts.firstCrack) marks.push({ kind: "first_crack", s: facts.firstCrack.time, label: "First crack", short: "FC" });
  if (facts.secondCrack) marks.push({ kind: "second_crack", s: facts.secondCrack.time, label: "Second crack", short: "SC" });
  if (facts.totalSeconds > 0) marks.push({ kind: "drop", s: facts.totalSeconds, label: "Drop", short: "Drop" });
  return marks.sort((a, b) => a.s - b.s);
}

// ---------------------------------------------------------------------------
// Chart

/**
 * Temperature samples for the curve chart on a real time axis (seconds since charge),
 * converted to the viewing unit. Prefers v2 `readings`, then the legacy column, then
 * roaster_data.temperatureData.
 */
export function deriveChartPoints(p: ProfileViewInput, viewUnit: TemperatureUnit): ChartPoint[] {
  const readings = v2Readings(p);
  if (readings.length > 0) {
    return readings
      .map((r) => ({
        time: Math.round(r.t / 100) / 10,
        bean: isNum(r.beanC) && r.beanC > 0 ? toUnit(r.beanC, "C", viewUnit) : undefined,
        setpoint: isNum(r.envC) && r.envC > 0 ? toUnit(r.envC, "C", viewUnit) : undefined,
      }))
      .sort((a, b) => a.time - b.time);
  }

  const stored = storedTempUnit(p);
  const legacy = asArray<{ time: number; targetTemp?: number | null; currentTemp?: number | null }>(p.temperature_data);

  if (legacy.length > 0) {
    return legacy
      .filter((d) => d && isNum(d.time))
      .map((d) => ({
        time: d.time,
        bean: isNum(d.currentTemp) && d.currentTemp > 0 ? toUnit(d.currentTemp, stored, viewUnit) : undefined,
        setpoint: isNum(d.targetTemp) && d.targetTemp > 0 ? toUnit(d.targetTemp, stored, viewUnit) : undefined,
      }))
      .sort((a, b) => a.time - b.time);
  }

  // roaster_data temperature samples are always stored in Celsius
  return asArray<{ time: number; temp?: number; targetTemp?: number; currentTemp?: number }>(roasterData(p).temperatureData)
    .filter((d) => d && isNum(d.time))
    .map((d) => {
      const bean = isNum(d.currentTemp) ? d.currentTemp : d.temp;
      return {
        time: d.time,
        bean: isNum(bean) && bean > 0 ? toUnit(bean, "C", viewUnit) : undefined,
        setpoint: isNum(d.targetTemp) && d.targetTemp > 0 ? toUnit(d.targetTemp, "C", viewUnit) : undefined,
      };
    })
    .sort((a, b) => a.time - b.time);
}

/** Number of real bean temperature readings (the curve needs at least 3). */
export const countBeanReadings = (points: ChartPoint[]) => points.filter((pt) => pt.bean !== undefined).length;

// ---------------------------------------------------------------------------
// Steps

const CONTROL_LABELS: Record<string, string> = {
  heat: "Heat",
  fan: "Fan",
  air: "Fan",
  power: "Power",
  setpoint: "Setpoint",
  program: "Program",
  profile: "Program",
  weight: "Weight",
  drum: "Drum",
  flame: "Flame",
  gas: "Gas",
  extend: "Extend",
};

const capitalise = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/[_-]+/g, " ") : s);

/** "Heat 7", "Setpoint 220 °C", "Extend +30 s", "Program P3". */
export function formatControl(
  control: string,
  value: number | string,
  viewUnit: TemperatureUnit = "C",
  roasterType?: string | null,
): string {
  const key = control.toLowerCase();
  const label = CONTROL_LABELS[key] ?? capitalise(control);
  // Values already carrying their label ("Heat 7", "Fan 9") are shown as stored
  if (typeof value === "string" && value.toLowerCase().startsWith(label.toLowerCase())) return value;
  if (key === "setpoint" && isNum(value)) {
    return `${label} ${Math.round(viewUnit === "F" ? convertTemperature(value, "C", "F") : value)} °${viewUnit}`;
  }
  if (key === "extend") return `${label} +${isNum(value) ? value : String(value).replace(/^\+/, "")}${isNum(value) ? " s" : ""}`;
  if ((key === "program" || key === "profile") && typeof value === "string") return `${label} ${value}`;
  if (roasterType?.startsWith("hottop") && (key === "heat" || key === "fan") && isNum(value)) return `${label} ${value}%`;
  return `${label} ${value}`;
}

/** Legacy starting-conditions keys (environment), as opposed to v2 control settings. */
const CONDITION_KEYS = new Set(["room_temp_c", "bean_temp_c", "humidity_percent", "altitude_m", "notes"]);

/** v2 starting settings ({ heat: 7, fan: 9 }) when present. */
function v2StartingSettings(p: ProfileViewInput): Record<string, number | string> {
  if (!isSchemaV2(p)) return {};
  const sc = asRecord(settingsOf(p).starting_conditions);
  const nested = asRecord(sc.settings ?? sc.controls);
  const source = Object.keys(nested).length ? nested : sc;
  const out: Record<string, number | string> = {};
  Object.entries(source).forEach(([k, v]) => {
    if (CONDITION_KEYS.has(k)) return;
    if (isNum(v) || (typeof v === "string" && v.trim())) out[k] = v as number | string;
  });
  return out;
}

/** v2 control changes, from roaster_data.controlChanges or roaster_settings.control_schedule (ms). */
function v2Controls(p: ProfileViewInput): V2Control[] {
  const isControl = (c: V2Control) => c && typeof c.control === "string" && isNum(c.t) && (isNum(c.value) || typeof c.value === "string");
  const fromData = asArray<V2Control>(roasterData(p).controlChanges).filter(isControl);
  if (fromData.length) return fromData;
  return asArray<V2Control & { time_seconds?: number }>(settingsOf(p).control_schedule)
    .map((c) => (c && !isNum(c.t) && isNum(c.time_seconds) ? { ...c, t: c.time_seconds * 1000 } : c))
    .filter(isControl);
}

/** Setpoint changes (Gene Cafe dial) as steps, deduplicated to real changes. */
function setpointSteps(p: ProfileViewInput, viewUnit: TemperatureUnit): RoastStep[] {
  const steps: RoastStep[] = [];
  let last: number | undefined;
  for (const point of deriveChartPoints(p, viewUnit)) {
    if (!isNum(point.setpoint)) continue;
    const rounded = Math.round(point.setpoint);
    if (last !== undefined && Math.abs(rounded - last) < 1) continue;
    steps.push({
      time: last === undefined ? 0 : point.time,
      kind: last === undefined ? "start" : "setting",
      title: last === undefined ? "Start" : "Change setpoint",
      values: [`Setpoint ${rounded} °${viewUnit}`],
    });
    last = rounded;
  }
  return steps;
}

function v2SettingsSteps(p: ProfileViewInput, viewUnit: TemperatureUnit): RoastStep[] {
  const roasterType = p.roaster_type ?? undefined;
  const steps: RoastStep[] = [];
  const start = v2StartingSettings(p);
  const startValues = Object.entries(start).map(([k, v]) => formatControl(k, v, viewUnit, roasterType));
  if (startValues.length) steps.push({ time: 0, kind: "start", title: "Start", values: startValues });

  // Group taps that happen within the same couple of seconds into one step
  const changes = [...v2Controls(p)].sort((a, b) => a.t - b.t);
  let group: V2Control[] = [];
  const flush = () => {
    if (!group.length) return;
    const time = Math.round(group[0].t / 1000);
    // Keep only the last value per control inside the group
    const latest = new Map<string, V2Control>();
    group.forEach((c) => latest.set(c.control, c));
    const all = [...latest.values()];
    const extensions = all.filter((c) => c.control.toLowerCase() === "extend");
    const others = all.filter((c) => c.control.toLowerCase() !== "extend");
    if (others.length) {
      const isStart = time <= 2 && !startValues.length;
      steps.push({
        time: isStart ? 0 : time,
        kind: isStart ? "start" : "setting",
        title: isStart ? "Start" : "Adjust controls",
        values: others.map((c) => formatControl(c.control, c.value, viewUnit, roasterType)),
      });
    }
    if (extensions.length) {
      // Each extension tap counts: sum the group
      const total = group.filter((c) => c.control.toLowerCase() === "extend").reduce((n, c) => n + (isNum(c.value) ? c.value : 30), 0);
      steps.push({ time, kind: "extension", title: "Extend roast", values: [`+${total} s`] });
    }
    group = [];
  };
  changes.forEach((c) => {
    if (group.length && c.t - group[0].t > 2000) flush();
    group.push(c);
  });
  flush();

  // Setpoint changes written to temperature_schedule ({time_seconds, target_temp_c})
  if (!changes.some((c) => c.control.toLowerCase() === "setpoint") && !("setpoint" in start)) {
    asArray<{ time_seconds: number; target_temp_c: number; note?: string }>(settingsOf(p).temperature_schedule).forEach((t) => {
      if (!isNum(t?.time_seconds) || !isNum(t.target_temp_c)) return;
      const value = formatControl("setpoint", t.target_temp_c, viewUnit, roasterType);
      const isStart = t.time_seconds <= 2;
      steps.push({ time: isStart ? 0 : t.time_seconds, kind: isStart ? "start" : "setting", title: isStart ? "Start" : "Change setpoint", values: [value], detail: t.note });
    });
  }
  return steps;
}

function legacySettingsSteps(p: ProfileViewInput, viewUnit: TemperatureUnit): RoastStep[] {
  const data = roasterData(p);
  const steps: RoastStep[] = [];

  // FreshRoast-style heat/fan log ('Low'|'Medium'|'High' or numeric 1–9)
  asArray<{ time: number; heatLevel?: string | number; fanSpeed?: string | number }>(data.settingChanges).forEach((change, index) => {
    const has = (v: unknown) => (isNum(v) || (typeof v === "string" && v.trim() !== ""));
    const values = [has(change.heatLevel) && `Heat ${change.heatLevel}`, has(change.fanSpeed) && `Fan ${change.fanSpeed}`].filter(Boolean) as string[];
    if (!values.length || !isNum(change.time)) return;
    const isStart = index === 0 && change.time <= 5;
    steps.push({ time: isStart ? 0 : change.time, kind: isStart ? "start" : "setting", title: isStart ? "Start" : "Adjust controls", values });
  });

  // Manual roasters: free-form heat settings
  asArray<{ time: number; setting?: string }>(data.heatSettings).forEach((h) => {
    if (h.setting && isNum(h.time)) steps.push({ time: h.time, kind: h.time <= 5 ? "start" : "setting", title: h.time <= 5 ? "Start" : "Adjust heat", values: [h.setting] });
  });

  // Behmor-style program + extensions. Taps within a few seconds are merged.
  if (typeof data.profile === "string") {
    const base = isNum(data.baseDuration) ? ` · ${formatClock(data.baseDuration)} base` : "";
    steps.push({ time: 0, kind: "start", title: "Start", values: [`Program ${data.profile}${base}`] });
  }
  const extensions = asArray<{ time: number; duration?: number }>(data.extensions).filter((e) => e && isNum(e.time)).sort((a, b) => a.time - b.time);
  let groupStart: number | undefined;
  let groupTotal = 0;
  const flushExt = () => {
    if (groupStart === undefined) return;
    steps.push({ time: groupStart, kind: "extension", title: "Extend roast", values: [`+${groupTotal} s`] });
    groupStart = undefined;
    groupTotal = 0;
  };
  let lastTime = -Infinity;
  extensions.forEach((ext) => {
    if (groupStart !== undefined && ext.time - lastTime > 5) flushExt();
    if (groupStart === undefined) groupStart = ext.time;
    groupTotal += ext.duration ?? 30;
    lastTime = ext.time;
  });
  flushExt();

  // Structured settings (pre-v2 roaster_settings)
  const settings = settingsOf(p);
  asArray<{ time_seconds: number; target_temp_c: number; note?: string }>(settings.temperature_schedule).forEach((t) => {
    if (!isNum(t?.time_seconds) || !isNum(t.target_temp_c)) return;
    const value = Math.round(viewUnit === "F" ? convertTemperature(t.target_temp_c, "C", "F") : t.target_temp_c);
    steps.push({ time: t.time_seconds, kind: t.time_seconds <= 5 ? "start" : "setting", title: t.time_seconds <= 5 ? "Start" : "Change setpoint", values: [`Setpoint ${value} °${viewUnit}`], detail: t.note });
  });
  asArray<{ time_seconds: number; heat_level?: string | number; fan_level?: string | number; drum_speed_rpm?: number; note?: string }>(settings.control_schedule).forEach((c) => {
    if (!c || !isNum(c.time_seconds)) return; // v2 entries ({control, value, t}) are handled elsewhere
    const fmt = (v: string | number) => (typeof v === "number" ? `${v}%` : v);
    const values = [
      c.heat_level !== undefined && `Heat ${fmt(c.heat_level)}`,
      c.fan_level !== undefined && `Fan ${fmt(c.fan_level)}`,
      c.drum_speed_rpm !== undefined && `Drum ${c.drum_speed_rpm} rpm`,
    ].filter(Boolean) as string[];
    steps.push({ time: c.time_seconds, kind: c.time_seconds <= 5 ? "start" : "setting", title: c.time_seconds <= 5 ? "Start" : "Adjust controls", values, detail: c.note });
  });

  return steps;
}

const MILESTONE_TITLES: Record<string, string> = {
  yellowing: "Yellowing",
  development_start: "Development",
  custom: "Note",
};

/** The ordered list of things the roaster actually did or observed. */
export function deriveRoastSteps(p: ProfileViewInput, facts: RoastFacts, viewUnit: TemperatureUnit): RoastStep[] {
  const stored = storedTempUnit(p);
  // v2 event temperatures are °C; legacy crack temps are in the effective stored unit
  const tempLabel = (t?: number) => (isNum(t) ? `${Math.round(convertTemperature(t, stored, viewUnit))} °${viewUnit}` : undefined);

  const hasV2Controls =
    v2Controls(p).length > 0 ||
    Object.keys(v2StartingSettings(p)).length > 0 ||
    (isSchemaV2(p) && asArray(settingsOf(p).temperature_schedule).length > 0);
  let steps = hasV2Controls ? v2SettingsSteps(p, viewUnit) : legacySettingsSteps(p, viewUnit);
  if (!steps.some((s) => s.kind === "start" || s.kind === "setting")) {
    steps = [...steps, ...setpointSteps(p, viewUnit)];
  }

  const milestones = milestonesOf(p);
  milestones.forEach((m) => {
    if (["first_crack", "second_crack", "drop"].includes(m.event_type)) return;
    const cues = [m.visual_cue, m.audio_cue, m.aroma_cue].filter(Boolean).join(" · ");
    steps.push({ time: m.time_seconds, kind: "milestone", title: m.label || MILESTONE_TITLES[m.event_type] || "Note", detail: cues || undefined });
  });
  if (!milestones.length) {
    // v2 events without milestones (or legacy rows that only have events)
    const tp = v2EventS(p, "turning_point");
    if (tp) steps.push({ time: Math.round(tp.s), kind: "milestone", title: "Turning point", values: tempLabel(tp.tempC) ? [tempLabel(tp.tempC)!] : undefined });
    if (facts.yellowing !== undefined) steps.push({ time: facts.yellowing, kind: "milestone", title: "Yellowing" });
  }

  if (facts.firstCrack) {
    steps.push({
      time: facts.firstCrack.time,
      kind: "first_crack",
      title: "First crack",
      values: tempLabel(facts.firstCrack.temp) ? [tempLabel(facts.firstCrack.temp)!] : undefined,
      detail: facts.developmentSeconds
        ? `Development starts. This roast ran ${formatClock(facts.developmentSeconds)} more before the drop.`
        : undefined,
    });
  }
  if (facts.secondCrack) {
    steps.push({
      time: facts.secondCrack.time,
      kind: "second_crack",
      title: "Second crack",
      values: tempLabel(facts.secondCrack.temp) ? [tempLabel(facts.secondCrack.temp)!] : undefined,
      detail: `Dropped ${formatClock(facts.totalSeconds - facts.secondCrack.time)} later.`,
    });
  }

  steps.push({ time: facts.totalSeconds, kind: "drop", title: "Drop and cool" });

  // Always begin with a start step
  if (!steps.some((s) => s.kind === "start")) steps.push({ time: 0, kind: "start", title: "Start" });

  const order: Record<StepKind, number> = { start: 0, setting: 1, extension: 1, milestone: 2, first_crack: 3, second_crack: 4, drop: 5 };
  steps.sort((a, b) => a.time - b.time || order[a.kind] - order[b.kind]);

  // Merge several start entries (e.g. program + heat/fan) into one
  const merged: RoastStep[] = [];
  for (const step of steps) {
    const prev = merged[merged.length - 1];
    if (step.kind === "start" && prev?.kind === "start") {
      prev.values = [...(prev.values ?? []), ...(step.values ?? [])];
      prev.detail = [prev.detail, step.detail].filter(Boolean).join(" ") || undefined;
      continue;
    }
    merged.push(step);
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Labels: roast level, process, place, origin, roaster

const LEVEL_WORDS = new Set([
  "very", "extra", "light", "lighter", "medium", "med", "dark", "darker", "city", "city+", "full", "fullcity", "half",
  "vienna", "french", "italian", "cinnamon", "nordic", "+", "plus", "to", "-", "roast", "roasted", "level",
]);
const LEVEL_CORE = new Set(["light", "medium", "med", "dark", "city", "city+", "fullcity", "vienna", "french", "italian", "cinnamon", "nordic"]);

/** "Full City", "City+", "Medium", "Dark Roast", "Light to Medium", "Medium city roast". Conservative. */
export function looksLikeRoastLevel(value?: string | null): boolean {
  const text = (value ?? "").trim().toLowerCase();
  if (!text || text.length > 40) return false;
  const words = text.replace(/\+/g, " + ").replace(/[/,-]/g, " ").split(/\s+/).filter(Boolean);
  if (!words.length) return false;
  return words.every((w) => LEVEL_WORDS.has(w)) && words.some((w) => LEVEL_CORE.has(w));
}

/** "240°", "240 °C", "430F" — a temperature typed in the old free-text field. */
export function looksLikeTemperature(value?: string | null): boolean {
  return /^\d{2,3}([.,]\d+)?\s*(°\s*[cf]?|º\s*[cf]?|[cf]|deg(rees)?\s*[cf]?)?$/i.test((value ?? "").trim());
}

const levelByLower = new Map<string, string>(
  Object.values(ROAST_LEVEL_LABELS).map((label) => [label.toLowerCase(), label] as const),
);

/** Roast level as a label: v2 `roaster_settings.roast_level`, else a legacy level-like `roast_process` (verbatim, tidied). */
export function roastLevelLabel(row: { roaster_settings?: ProfileViewInput["roaster_settings"]; roast_process?: string | null }): string | undefined {
  const level = asRecord(row.roaster_settings).roast_level;
  if (typeof level === "string" && level) {
    return ROAST_LEVEL_LABELS[level as RoastLevel] ?? tidyLabel(level.replace(/_/g, " "));
  }
  const legacy = row.roast_process?.trim();
  if (!legacy || hasV2Process(row) || asRecord(row.roaster_settings).schema_version === 2) return undefined;
  if (looksLikeRoastLevel(legacy)) {
    const known = levelByLower.get(legacy.toLowerCase().replace(/\s+/g, " "));
    return known ?? tidyLabel(legacy);
  }
  if (looksLikeTemperature(legacy)) return legacy.replace(/\s+/g, " ");
  return undefined;
}

/** True when the roast level came from the legacy free-text field rather than a v2 key. */
export function isLegacyLevel(row: { roaster_settings?: ProfileViewInput["roaster_settings"]; roast_process?: string | null }): boolean {
  const level = asRecord(row.roaster_settings).roast_level;
  return !(typeof level === "string" && level) && roastLevelLabel(row) !== undefined;
}

function hasV2Process(row: { roaster_settings?: ProfileViewInput["roaster_settings"] }): boolean {
  const process = asRecord(row.roaster_settings).process;
  return typeof process === "string" && process.length > 0;
}

const processByLower = new Map<string, string>([
  ...Object.entries(PROCESS_LABELS).map(([k, label]) => [k.replace(/_/g, " "), label] as const),
  ...Object.values(PROCESS_LABELS).map((label) => [label.toLowerCase(), label] as const),
  ["wet hulled", "Wet-hulled"],
]);

/**
 * Processing method label. Prefers v2 `roaster_settings.process`; otherwise the
 * legacy `roast_process`, unless it looks like a roast level or a temperature.
 */
export function processLabel(row: { roaster_settings?: ProfileViewInput["roaster_settings"]; roast_process?: string | null }): string | undefined {
  const process = asRecord(row.roaster_settings).process;
  if (typeof process === "string" && process) {
    return PROCESS_LABELS[process as ProcessMethod] ?? tidyLabel(process.replace(/_/g, " "));
  }
  const legacy = row.roast_process?.trim();
  if (!legacy) return undefined;
  const isV2 = asRecord(row.roaster_settings).schema_version === 2;
  if (!isV2 && (looksLikeRoastLevel(legacy) || looksLikeTemperature(legacy))) return undefined;
  return processByLower.get(legacy.toLowerCase().replace(/\s+/g, " ")) ?? tidyLabel(legacy);
}

/** "Garage · 12 °C" from v2 settings (environment/place + ambient_c). */
export function placeLabel(row: { roaster_settings?: ProfileViewInput["roaster_settings"] }, viewUnit: TemperatureUnit = "C"): string | undefined {
  const s = asRecord(row.roaster_settings);
  const placeRaw = (s.environment ?? s.place) as unknown;
  const place = typeof placeRaw === "string" && placeRaw
    ? PLACE_LABELS[placeRaw as RoastPlace] ?? tidyLabel(placeRaw)
    : undefined;
  const ambient = isNum(s.ambient_c) ? `${Math.round(viewUnit === "F" ? convertTemperature(s.ambient_c, "C", "F") : s.ambient_c)} °${viewUnit} ambient` : undefined;
  const parts = [place, ambient].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

/** Origin for display, normalised (Columbia/Combia → Colombia, Brasil → Brazil). */
export function originLabel(origin?: string | null): string {
  return normaliseOrigin(origin);
}

export function roasterName(roasterType: string | null | undefined, fallback?: string | null): string | undefined {
  if (roasterType && ROASTER_SPECS[roasterType as RoasterType]) return ROASTER_SPECS[roasterType as RoasterType].displayName;
  return fallback ? tidyLabel(fallback) || undefined : undefined;
}

export function checkBatchSize(roasterType: string | null | undefined, weightIn?: number): BatchCheck | undefined {
  if (!roasterType || !weightIn) return undefined;
  const spec = ROASTER_SPECS[roasterType as RoasterType];
  if (!spec?.minBatchSize || !spec?.maxBatchSize) return undefined;
  const status = weightIn < spec.minBatchSize ? "below" : weightIn > spec.maxBatchSize ? "above" : "within";
  return { min: spec.minBatchSize, max: spec.maxBatchSize, status };
}

/** Text used for client-side search over a row. */
export function rowSearchText(row: ProfileRowInput): string {
  return [
    row.beans_name,
    row.origin,
    originLabel(row.origin),
    row.farm_name,
    row.roast_process,
    processLabel(row),
    roastLevelLabel(row),
    row.coffee_roaster,
    roasterName(row.roaster_type, row.coffee_roaster),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * One mapping from a roast_profiles row to the shared RoastCard data,
 * used by Discover, My roasts and the landing page.
 * Details: origin · process (· farm when different). Level is separate (`levelLabel`).
 */
export function rowToCard(row: ProfileRowInput): RoastCardData {
  const facts = deriveRoastFacts(row);
  const roasterType = row.roaster_type && ROASTER_SPECS[row.roaster_type as RoasterType] ? (row.roaster_type as RoasterType) : undefined;
  const origin = originLabel(row.origin);
  const farm = tidyLabel(row.farm_name);
  const process = processLabel(row);
  const details = [origin, process, farm && farm.toLowerCase() !== origin.toLowerCase() ? farm : ""].filter(Boolean) as string[];
  const likes = typeof row.likes === "number" ? row.likes : Array.isArray(row.likes) ? row.likes[0]?.count ?? 0 : 0;

  return {
    id: row.id,
    title: tidyLabel(row.beans_name) || "Untitled roast",
    details,
    levelLabel: roastLevelLabel(row),
    roasterType,
    roasterLabel: roasterName(roasterType, row.coffee_roaster) ?? "Roaster not specified",
    createdAt: row.created_at,
    likes,
    facts,
    phases: deriveRoastPhases(row, facts),
  };
}

// ---------------------------------------------------------------------------
// Tasting

/**
 * A date-only value ("2026-05-25" or "2026-05-25T00:00:00+00:00") as a local Date at noon,
 * so it never shifts a day across time zones.
 */
export function parseDateOnly(value?: string | null): Date | undefined {
  const match = (value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
}

/** Whole days between the roast and the cupping date (rest), or undefined when unknown or negative. */
export function restDaysBetween(roastedAt?: string | null, cuppedOn?: string | null): number | undefined {
  const cupped = parseDateOnly(cuppedOn);
  const roasted = roastedAt ? new Date(roastedAt) : undefined;
  if (!cupped || !roasted || Number.isNaN(roasted.getTime())) return undefined;
  const roastedDay = Date.UTC(roasted.getFullYear(), roasted.getMonth(), roasted.getDate());
  const cuppedDay = Date.UTC(cupped.getFullYear(), cupped.getMonth(), cupped.getDate());
  const days = Math.round((cuppedDay - roastedDay) / 86_400_000);
  return days >= 0 ? days : undefined;
}
