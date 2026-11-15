import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatClock, type RoastFacts, type RoastPhase } from "@/utils/roastProfileView";

export const PHASE_COLOR: Record<RoastPhase["key"], string> = {
  drying: "bg-[hsl(var(--phase-drying))]",
  maillard: "bg-[hsl(var(--phase-maillard))]",
  beforeCrack: "bg-[hsl(var(--phase-precrack))]",
  development: "bg-[hsl(var(--phase-development))]",
};

interface StatProps {
  label: string;
  value: string;
  sub?: string;
}

function Stat({ label, value, sub }: StatProps) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground sm:text-2xl">{value}</dd>
      {sub && <dd className="mt-0.5 text-xs text-muted-foreground">{sub}</dd>}
    </div>
  );
}

function PhaseBar({ phases, facts }: { phases: RoastPhase[]; facts: RoastFacts }) {
  const total = facts.totalSeconds;
  const sc = facts.secondCrack?.time;
  const scLeft = sc !== undefined ? (sc / total) * 100 : undefined;
  const summary = phases.map((p) => `${p.label} ${formatClock(p.end - p.start)} (${p.percent.toFixed(0)}%)`).join(", ");

  return (
    <div className="space-y-3">
      <div className="relative" role="img" aria-label={`Roast phases: ${summary}${sc !== undefined ? `. Second crack at ${formatClock(sc)}` : ""}`}>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {phases.map((phase) => (
            <div key={phase.key} className={cn("h-full", PHASE_COLOR[phase.key])} style={{ width: `${phase.percent}%` }} />
          ))}
        </div>
        {scLeft !== undefined && (
          <div className="absolute -top-1 h-5 w-0.5 rounded bg-foreground" style={{ left: `calc(${scLeft}% - 1px)` }} aria-hidden />
        )}
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-hidden>
        {phases.map((phase) => (
          <li key={phase.key} className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", PHASE_COLOR[phase.key])} />
            <span className="text-muted-foreground">{phase.label}</span>
            <span className="font-mono tabular-nums">{formatClock(phase.end - phase.start)}</span>
            <span className="text-muted-foreground">· {phase.percent.toFixed(0)}%</span>
          </li>
        ))}
        {sc !== undefined && (
          <li className="flex items-center gap-2">
            <span className="h-3 w-0.5 rounded bg-foreground" />
            <span className="text-muted-foreground">Second crack</span>
            <span className="font-mono tabular-nums">{formatClock(sc)}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

export function RoastSummary({ facts, phases }: { facts: RoastFacts; phases: RoastPhase[] }) {
  const weightSub =
    facts.weightIn && facts.weightOut ? `${facts.weightIn} g → ${facts.weightOut} g` : facts.weightIn ? `${facts.weightIn} g batch` : undefined;

  return (
    <Card className="shadow-coffee">
      <CardContent className="space-y-6 p-4 sm:p-6">
        <h2 className="sr-only">Roast summary</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))]">
          <Stat label="Total time" value={formatClock(facts.totalSeconds)} />
          {facts.firstCrack && <Stat label="First crack" value={formatClock(facts.firstCrack.time)} />}
          {facts.developmentSeconds !== undefined && facts.developmentPercent !== undefined && (
            <Stat
              label="Development"
              value={formatClock(facts.developmentSeconds)}
              sub={`${facts.developmentPercent.toFixed(1)}% of roast after first crack`}
            />
          )}
          {facts.weightLossPercent !== undefined ? (
            <Stat label="Weight loss" value={`${facts.weightLossPercent.toFixed(1)}%`} sub={weightSub} />
          ) : (
            facts.weightIn && <Stat label="Batch" value={`${facts.weightIn} g`} />
          )}
        </dl>
        {phases.length > 0 && <PhaseBar phases={phases} facts={facts} />}
      </CardContent>
    </Card>
  );
}
