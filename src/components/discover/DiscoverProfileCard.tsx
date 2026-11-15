import { Link } from "react-router-dom";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PHASE_COLOR } from "@/components/profile/RoastSummary";
import { formatClock, type RoastFacts, type RoastPhase } from "@/utils/roastProfileView";
import { getRoasterPrimaryColor } from "@/utils/roasterColors";
import type { RoasterType } from "@/types/roaster.types";

export interface DiscoverCardData {
  id: string;
  title: string;
  /** Origin · process · farm, already tidied */
  details: string[];
  roasterType?: RoasterType;
  roasterLabel: string;
  createdAt: string;
  likes: number;
  facts: RoastFacts;
  phases: RoastPhase[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

function Metric({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 font-mono text-sm font-semibold tabular-nums", value ? "text-foreground" : "text-muted-foreground/60")}>
        {value ?? "—"}
      </dd>
    </div>
  );
}

function MiniPhaseBar({ phases, facts }: { phases: RoastPhase[]; facts: RoastFacts }) {
  if (phases.length === 0) {
    return <div className="h-1.5 w-full rounded-full bg-muted" aria-hidden />;
  }
  const sc = facts.secondCrack?.time;
  return (
    <div className="relative" aria-hidden>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
        {phases.map((phase) => (
          <div key={phase.key} className={cn("h-full", PHASE_COLOR[phase.key])} style={{ width: `${phase.percent}%` }} />
        ))}
      </div>
      {sc !== undefined && facts.totalSeconds > 0 && (
        <div
          className="absolute -top-0.5 h-2.5 w-0.5 rounded bg-foreground"
          style={{ left: `calc(${(sc / facts.totalSeconds) * 100}% - 1px)` }}
        />
      )}
    </div>
  );
}

export function DiscoverProfileCard({ card }: { card: DiscoverCardData }) {
  const { facts } = card;
  return (
    <li className="h-full">
      <Link
        to={`/profile/${card.id}`}
        className="group flex h-full flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-coffee transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary">
              {card.title}
            </h2>
            {card.details.length > 0 && (
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{card.details.join(" · ")}</p>
            )}
          </div>
          {card.likes > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground" aria-label={`${card.likes} ${card.likes === 1 ? "like" : "likes"}`}>
              <ThumbsUp className="h-3 w-3" aria-hidden />
              <span aria-hidden>{card.likes}</span>
            </span>
          )}
        </div>

        <dl className="grid grid-cols-4 gap-2">
          <Metric label="Total" value={facts.totalSeconds ? formatClock(facts.totalSeconds) : undefined} />
          <Metric label="1st crack" value={facts.firstCrack ? formatClock(facts.firstCrack.time) : undefined} />
          <Metric label="Dev" value={facts.developmentPercent !== undefined ? `${facts.developmentPercent.toFixed(1)}%` : undefined} />
          <Metric label="Loss" value={facts.weightLossPercent !== undefined ? `${facts.weightLossPercent.toFixed(1)}%` : undefined} />
        </dl>

        <MiniPhaseBar phases={card.phases} facts={facts} />

        <div className="mt-auto flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: card.roasterType ? getRoasterPrimaryColor(card.roasterType) : "hsl(var(--muted-foreground))" }}
              aria-hidden
            />
            <span className="truncate">{card.roasterLabel}</span>
          </span>
          <time dateTime={card.createdAt} className="shrink-0">{formatDate(card.createdAt)}</time>
        </div>
      </Link>
    </li>
  );
}
