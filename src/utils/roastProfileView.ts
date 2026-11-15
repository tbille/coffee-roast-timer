/**
 * Derives everything the public roast profile page displays from a stored profile.
 *
 * Rules:
 * - Only real, recorded data is turned into facts and steps. Nothing is estimated.
 * - Data from every storage generation is supported: legacy columns
 *   (temperature_data, crack_events), mode-specific roaster_data, and the
 *   optional milestones/roaster_settings fields.
 */

import { convertTemperature, type TemperatureUnit } from "@/utils/temperatureConversion";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import type { RoasterType } from "@/types/roaster.types";
import type { RoastMilestone, RoasterSettings } from "@/types/roast.types";

/** Loose shape of a profile row: every field the view reads, all optional. */
export interface ProfileViewInput {
  duration_seconds: number;
  roaster_type?: RoasterType | string | null;
  temperature_unit?: TemperatureUnit | null;
  temperature_data?: Array<{ time: number; targetTemp?: number; currentTemp?: number }> | null;
  crack_events?: Array<{ time: number; type: "first" | "second"; currentTemp?: number; timestamp?: number }> | null;
  roaster_data?: Record<string, unknown> | null;
  milestones?: RoastMilestone[] | null;
  roaster_settings?: RoasterSettings | null;
  initial_weight?: number | null;
  final_weight?: number | null;
}

export interface CrackFact {
  time: number;
  /** In the profile's stored unit */
  temp?: number;
}

export interface RoastFacts {
  totalSeconds: number;
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
  time: number;
  bean?: number;
  setpoint?: number;
}

export interface BatchCheck {
  min: number;
  max: number;
  status: "below" | "within" | "above";
}

export const formatClock = (seconds: number): string => {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const roasterData = (p: ProfileViewInput) => (p.roaster_data ?? {}) as Record<string, unknown>;

/**
 * Behmor roasts saved before elapsed-time recording was fixed stored the
 * countdown ("time remaining") instead of elapsed seconds. Every event also has
 * a wall-clock timestamp, so the true elapsed time is recoverable.
 */
function elapsedFor(p: ProfileViewInput, event: { time: number; timestamp?: unknown }): number {
  const start = roasterData(p).startTime;
  if (p.roaster_type === "behmor-2000ab" && isNum(start) && isNum(event.timestamp)) {
    const elapsed = (event.timestamp - start) / 1000;
    if (elapsed >= 0 && elapsed <= p.duration_seconds + 5) return Math.round(elapsed);
  }
  return event.time;
}

function crackEvents(p: ProfileViewInput) {
  const legacy = asArray<{ time: number; type: "first" | "second"; currentTemp?: number; timestamp?: number }>(p.crack_events);
  const source = legacy.length > 0 ? legacy : asArray<typeof legacy[number]>(roasterData(p).crackEvents);
  return source
    .filter((e) => e && isNum(e.time) && (e.type === "first" || e.type === "second"))
    .map((e) => ({ ...e, time: elapsedFor(p, e) }));
}

function findCrack(p: ProfileViewInput, type: "first" | "second"): CrackFact | undefined {
  const milestoneType = type === "first" ? "first_crack" : "second_crack";
  const milestone = asArray<RoastMilestone>(p.milestones).find((m) => m.event_type === milestoneType);
  if (milestone && isNum(milestone.time_seconds)) return { time: milestone.time_seconds };

  const event = crackEvents(p).find((e) => e.type === type);
  if (!event) return undefined;
  const temp = isNum(event.currentTemp) && event.currentTemp > 0 ? event.currentTemp : undefined;
  return { time: event.time, temp };
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

  const facts: RoastFacts = { totalSeconds, firstCrack: validFirstCrack, secondCrack };

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
 * Roast phases from recorded events only. Drying/Maillard are split only when a
 * real yellowing milestone exists; otherwise the pre-crack period is one phase.
 */
export function deriveRoastPhases(p: ProfileViewInput, facts: RoastFacts): RoastPhase[] {
  const total = facts.totalSeconds;
  if (!total) return [];
  const fc = facts.firstCrack?.time;
  const yellowing = asArray<RoastMilestone>(p.milestones).find((m) => m.event_type === "yellowing")?.time_seconds;
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

const toUnit = (value: number, from: TemperatureUnit, to: TemperatureUnit) => round1(convertTemperature(value, from, to));

/** Temperature samples for the curve chart, converted to the viewing unit. */
export function deriveChartPoints(p: ProfileViewInput, viewUnit: TemperatureUnit): ChartPoint[] {
  const stored: TemperatureUnit = p.temperature_unit === "F" ? "F" : "C";
  const legacy = asArray<{ time: number; targetTemp?: number; currentTemp?: number }>(p.temperature_data);

  if (legacy.length > 0) {
    return legacy
      .filter((d) => isNum(d.time))
      .map((d) => ({
        time: d.time,
        bean: isNum(d.currentTemp) && d.currentTemp > 0 ? toUnit(d.currentTemp, stored, viewUnit) : undefined,
        setpoint: isNum(d.targetTemp) && d.targetTemp > 0 ? toUnit(d.targetTemp, stored, viewUnit) : undefined,
      }))
      .sort((a, b) => a.time - b.time);
  }

  // roaster_data temperature samples are always stored in Celsius
  return asArray<{ time: number; temp?: number; targetTemp?: number; currentTemp?: number }>(roasterData(p).temperatureData)
    .filter((d) => isNum(d.time))
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
      values: [`Setpoint ${rounded}°${viewUnit}`],
    });
    last = rounded;
  }
  return steps;
}

function settingsSteps(p: ProfileViewInput, viewUnit: TemperatureUnit): RoastStep[] {
  const data = roasterData(p);
  const steps: RoastStep[] = [];

  // FreshRoast-style heat/fan log
  asArray<{ time: number; heatLevel?: string; fanSpeed?: string }>(data.settingChanges).forEach((change, index) => {
    const values = [change.heatLevel && `Heat ${change.heatLevel}`, change.fanSpeed && `Fan ${change.fanSpeed}`].filter(Boolean) as string[];
    if (!values.length || !isNum(change.time)) return;
    const isStart = index === 0 && change.time <= 5;
    steps.push({ time: isStart ? 0 : change.time, kind: isStart ? "start" : "setting", title: isStart ? "Start" : "Adjust controls", values });
  });

  // Manual roasters: free-form heat settings
  asArray<{ time: number; setting?: string }>(data.heatSettings).forEach((h) => {
    if (h.setting && isNum(h.time)) steps.push({ time: h.time, kind: h.time <= 5 ? "start" : "setting", title: h.time <= 5 ? "Start" : "Adjust heat", values: [h.setting] });
  });

  // Behmor-style program + extensions
  if (typeof data.profile === "string") {
    const base = isNum(data.baseDuration) ? ` · ${formatClock(data.baseDuration)} base` : "";
    steps.push({ time: 0, kind: "start", title: "Start", values: [`Program ${data.profile}${base}`] });
  }
  asArray<{ time: number; duration?: number; timestamp?: number }>(data.extensions).forEach((ext) => {
    if (!isNum(ext.time)) return;
    steps.push({ time: elapsedFor(p, ext), kind: "extension", title: "Extend roast", values: [`+${ext.duration ?? 30}s`] });
  });

  // Structured settings (newer profiles)
  const settings = p.roaster_settings ?? {};
  asArray<{ time_seconds: number; target_temp_c: number; note?: string }>(settings.temperature_schedule).forEach((t) => {
    const value = Math.round(viewUnit === "F" ? convertTemperature(t.target_temp_c, "C", "F") : t.target_temp_c);
    steps.push({ time: t.time_seconds, kind: t.time_seconds <= 5 ? "start" : "setting", title: t.time_seconds <= 5 ? "Start" : "Change setpoint", values: [`Setpoint ${value}°${viewUnit}`], detail: t.note });
  });
  asArray<{ time_seconds: number; heat_level?: string | number; fan_level?: string | number; drum_speed_rpm?: number; note?: string }>(settings.control_schedule).forEach((c) => {
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
  const stored: TemperatureUnit = p.temperature_unit === "F" ? "F" : "C";
  const tempLabel = (t?: number) => (isNum(t) ? `${Math.round(convertTemperature(t, stored, viewUnit))}°${viewUnit}` : undefined);

  let steps = settingsSteps(p, viewUnit);
  if (!steps.some((s) => s.kind === "start" || s.kind === "setting")) {
    steps = [...steps, ...setpointSteps(p, viewUnit)];
  }

  asArray<RoastMilestone>(p.milestones).forEach((m) => {
    if (["first_crack", "second_crack", "drop"].includes(m.event_type) || !isNum(m.time_seconds)) return;
    const cues = [m.visual_cue, m.audio_cue, m.aroma_cue].filter(Boolean).join(" · ");
    steps.push({ time: m.time_seconds, kind: "milestone", title: m.label || MILESTONE_TITLES[m.event_type] || "Note", detail: cues || undefined });
  });

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

export function checkBatchSize(roasterType: string | null | undefined, weightIn?: number): BatchCheck | undefined {
  if (!roasterType || !weightIn) return undefined;
  const spec = ROASTER_SPECS[roasterType as RoasterType];
  if (!spec?.minBatchSize || !spec?.maxBatchSize) return undefined;
  const status = weightIn < spec.minBatchSize ? "below" : weightIn > spec.maxBatchSize ? "above" : "within";
  return { min: spec.minBatchSize, max: spec.maxBatchSize, status };
}

export function roasterName(roasterType: string | null | undefined, fallback?: string | null): string | undefined {
  if (roasterType && ROASTER_SPECS[roasterType as RoasterType]) return ROASTER_SPECS[roasterType as RoasterType].displayName;
  return fallback || undefined;
}
