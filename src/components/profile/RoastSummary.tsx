import { Card, CardContent } from "@/components/ui/card";
import { PhaseBar } from "@/components/roast-card/PhaseBar";
import { StatStrip, type StatItem } from "@/components/roast-card/StatStrip";
import { formatClock, formatPercent } from "@/lib/format";
import type { RoastFacts, RoastPhase } from "@/utils/roastProfileView";

export function RoastSummary({ facts, phases }: { facts: RoastFacts; phases: RoastPhase[] }) {
  const weightSub =
    facts.weightIn && facts.weightOut ? `${facts.weightIn} g → ${facts.weightOut} g` : facts.weightIn ? `${facts.weightIn} g batch` : undefined;

  const stats: StatItem[] = [{ label: "Total time", value: formatClock(facts.totalSeconds) }];
  if (facts.firstCrack) stats.push({ label: "First crack", value: formatClock(facts.firstCrack.time) });
  if (facts.developmentSeconds !== undefined && facts.developmentPercent !== undefined) {
    stats.push({
      label: "Development",
      value: formatClock(facts.developmentSeconds),
      sub: `${formatPercent(facts.developmentPercent)} of roast after first crack`,
    });
  }
  if (facts.weightLossPercent !== undefined) {
    stats.push({ label: "Weight loss", value: formatPercent(facts.weightLossPercent), sub: weightSub });
  } else if (facts.weightIn) {
    stats.push({ label: "Batch", value: `${facts.weightIn} g` });
  }

  const sc = facts.secondCrack?.time;

  return (
    <Card>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <h2 className="sr-only">Roast summary</h2>
        <StatStrip stats={stats} size="md" />
        {phases.length > 0 && (
          <PhaseBar
            phases={phases}
            totalS={facts.totalSeconds}
            markers={sc !== undefined ? [{ s: sc, label: "Second crack" }] : []}
            size="md"
            showLegend
          />
        )}
      </CardContent>
    </Card>
  );
}
