import type { RoastCardData } from "@/components/roast-card/RoastCard";
import type { MyRoastRow } from "@/hooks/useMyRoasts";
import { normaliseOrigin } from "@/lib/origins";
import { deriveRoastFacts, deriveRoastPhases, type ProfileViewInput } from "@/utils/roastProfileView";
import { roasterLabel } from "@/components/review/draftView";
import { ROAST_LEVEL_LABELS, type RoastLevel } from "@/types/roast-session.types";
import type { RoasterType } from "@/types/roaster.types";
import type { TrendPoint } from "./TrendStrip";

export function rowFacts(row: MyRoastRow) {
  const input = row as unknown as ProfileViewInput;
  const facts = deriveRoastFacts(input);
  return { facts, phases: deriveRoastPhases(input, facts) };
}

function levelLabel(settings: unknown): string | undefined {
  const level = (settings as { roast_level?: unknown } | null)?.roast_level;
  return typeof level === "string" && level in ROAST_LEVEL_LABELS ? ROAST_LEVEL_LABELS[level as RoastLevel] : undefined;
}

export function rowToCard(row: MyRoastRow): RoastCardData {
  const { facts, phases } = rowFacts(row);
  return {
    id: row.id,
    title: row.beans_name?.trim() || "Unnamed bean",
    details: [normaliseOrigin(row.origin), row.roast_process?.trim() ?? ""].filter(Boolean),
    levelLabel: levelLabel(row.roaster_settings),
    roasterType: (row.roaster_type ?? undefined) as RoasterType | undefined,
    roasterLabel: roasterLabel(row.roaster_type),
    createdAt: row.created_at,
    facts,
    phases,
  };
}

export function rowTrendPoint(row: MyRoastRow): TrendPoint {
  const { facts } = rowFacts(row);
  const dev = facts.developmentPercent;
  return {
    at: row.created_at,
    firstCrackS: facts.firstCrack?.time,
    // Implausible marks stay out of the trend (they are fixed at the source, not shamed).
    devPercent: dev !== undefined && dev >= 3 && dev <= 50 ? dev : undefined,
    lossPercent: facts.weightLossPercent,
  };
}

/** Grouping key for bean names: case, accents, punctuation and spacing ignored. */
export function beanKey(name: string | null | undefined): string {
  return (name ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim() || "unnamed bean";
}
