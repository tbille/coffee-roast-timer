/**
 * Read-side helpers that turn a local draft into the same facts, phases and
 * card data used for saved rows, so the post-roast card, My roasts and the
 * saved profile all show identical numbers.
 */
import { deriveRoastFacts, deriveRoastPhases, roasterName, type ProfileViewInput, type RoastFacts, type RoastPhase } from "@/utils/roastProfileView";
import type { RoastCardData } from "@/components/roast-card/RoastCard";
import { normaliseOrigin } from "@/lib/origins";
import { LOCAL_REF_PREFIX } from "@/lib/drafts";
import { crackEvents, findEvent, milestones, UNNAMED_BEAN } from "@/lib/saveRoast";
import type { RoasterType } from "@/types/roaster.types";
import type { RoastMilestone } from "@/types/roast.types";
import {
  PROCESS_LABELS,
  ROAST_LEVEL_LABELS,
  type ControlChange,
  type RoastDraft,
  type RoastEventType,
  type RoastReference,
} from "@/types/roast-session.types";

export function draftViewInput(draft: RoastDraft): ProfileViewInput {
  const { result, details } = draft;
  return {
    duration_seconds: Math.round(result.durationSeconds),
    roaster_type: result.roasterType,
    temperature_unit: "C",
    crack_events: crackEvents(draft),
    milestones: milestones(draft) as RoastMilestone[],
    initial_weight: details.weightInGrams ?? result.batchGrams,
    final_weight: details.weightOutGrams,
  };
}

export function draftFacts(draft: RoastDraft): { facts: RoastFacts; phases: RoastPhase[] } {
  const input = draftViewInput(draft);
  const facts = deriveRoastFacts(input);
  return { facts, phases: deriveRoastPhases(input, facts) };
}

export function draftTitle(draft: RoastDraft): string {
  return draft.details.beanName?.trim() || UNNAMED_BEAN;
}

export function roasterLabel(type: string | null | undefined): string {
  return roasterName(type) ?? "Unknown roaster";
}

export function draftToCard(draft: RoastDraft): RoastCardData {
  const { details, result } = draft;
  const { facts, phases } = draftFacts(draft);
  return {
    id: result.id,
    title: draftTitle(draft),
    details: [normaliseOrigin(details.origin), details.process ? PROCESS_LABELS[details.process] : ""].filter(Boolean),
    levelLabel: details.roastLevel ? ROAST_LEVEL_LABELS[details.roastLevel] : undefined,
    roasterType: result.roasterType,
    roasterLabel: roasterLabel(result.roasterType),
    createdAt: new Date(result.chargedAt).toISOString(),
    facts,
    phases,
  };
}

const CONTROL_LABELS: Record<string, string> = {
  heat: "Heat",
  fan: "Fan",
  setpoint: "Setpoint",
  program: "Program",
  extend: "Extend",
  flame: "Flame",
  weight: "Weight",
};

export function controlLabel(c: Pick<ControlChange, "control" | "value">): string {
  if (c.control === "extend") return `+${typeof c.value === "number" ? `${c.value} s` : c.value}`;
  if (c.control === "setpoint" && typeof c.value === "number") return `Setpoint ${Math.round(c.value)} °C`;
  const name = CONTROL_LABELS[c.control] ?? `${c.control.charAt(0).toUpperCase()}${c.control.slice(1)}`;
  return `${name} ${c.value}`;
}

/**
 * The reference handed to the next batch. `savedId` is the account row id when
 * the roast is synced; otherwise the reference points at this device (`local:<id>`).
 */
export function referenceFromDraft(draft: RoastDraft, savedId?: string): RoastReference {
  const { result, details } = draft;
  const s = (ms?: number) => (ms === undefined ? undefined : Math.round(ms / 1000));
  return {
    id: savedId ?? (draft.syncedAt ? result.id : `${LOCAL_REF_PREFIX}${result.id}`),
    name: draftTitle(draft),
    roastedAt: new Date(result.chargedAt).toISOString(),
    roasterType: result.roasterType as RoasterType,
    yellowingS: s(findEvent(result.events, "yellowing")?.t),
    firstCrackS: s(findEvent(result.events, "first_crack")?.t),
    secondCrackS: s(findEvent(result.events, "second_crack")?.t),
    dropS: Math.round(result.durationSeconds),
    cues: result.controlChanges.map((c) => ({ s: Math.round(c.t / 1000), label: controlLabel(c) })),
    startingSettings: result.startingSettings,
    batchGrams: details.weightInGrams ?? result.batchGrams,
  };
}

/** `/roast?roaster=…&ref=…` for "Roast again". */
export function roastAgainHref(roasterType: string | null | undefined, refId: string): string {
  const params = new URLSearchParams();
  if (roasterType) params.set("roaster", roasterType);
  params.set("ref", refId);
  return `/roast?${params.toString()}`;
}

/** DOM id of an event's time input on the post-roast card. */
export const eventInputId = (baseId: string, type: RoastEventType) => `${baseId}-event-${type}`;
