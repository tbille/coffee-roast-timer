import type { ReactNode } from "react";
import { Link } from "react-router";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { RoasterType } from "@/types/roaster.types";
import { PhaseBar, type PhaseBarSegment } from "./PhaseBar";
import { StatStrip, cardStats, type StatFacts } from "./StatStrip";

export interface RoastCardData {
  id: string;
  title: string;
  /** Origin · process · farm, already tidied. The level label is appended when given. */
  details: string[];
  /** Roast level label ("City+") when known */
  levelLabel?: string;
  roasterType?: RoasterType;
  /** Machine name shown as neutral text in the footer */
  roasterLabel: string;
  /** ISO date */
  createdAt: string;
  likes?: number;
  /** `RoastFacts` from utils/roastProfileView fits */
  facts: StatFacts & { secondCrack?: { time: number } };
  /** `RoastPhase[]` from utils/roastProfileView fits */
  phases: PhaseBarSegment[];
}

export interface RoastCardProps {
  card: RoastCardData;
  /** Link target. Defaults to `/profile/:id`; pass `null` for a non-link card (e.g. a picker using `onSelect`). */
  href?: string | null;
  /** Owner controls (kebab menu, buttons). Rendered above the stretched link so they stay clickable. */
  actions?: ReactNode;
  /** Extra content under the phase bar (e.g. "Selected" state in a picker) */
  children?: ReactNode;
  /** Wrapper element: `li` when rendered inside a `<ul>` grid (default), `div` otherwise */
  as?: "li" | "div";
  headingLevel?: "h2" | "h3";
  className?: string;
}

/**
 * One card for a roast everywhere: Discover, latest roasts, My roasts, Compare picker.
 * Border-only, no colour coding of roasters.
 */
export function RoastCard({ card, href, actions, children, as = "li", headingLevel = "h2", className }: RoastCardProps) {
  const Wrapper = as;
  const Heading = headingLevel;
  const target = href === undefined ? `/profile/${card.id}` : href;
  const details = card.levelLabel ? [...card.details, card.levelLabel] : card.details;
  const likes = card.likes ?? 0;
  const sc = card.facts.secondCrack?.time;

  return (
    <Wrapper
      className={cn(
        "group relative flex h-full flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground transition-colors duration-150 sm:p-5",
        target && "hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Heading className="line-clamp-2 text-base font-semibold leading-snug">
            {target ? (
              <Link
                to={target}
                className="outline-hidden transition-colors after:absolute after:inset-0 after:rounded-lg after:content-[''] group-hover:text-primary"
              >
                {card.title}
              </Link>
            ) : (
              card.title
            )}
          </Heading>
          {details.length > 0 && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{details.join(" · ")}</p>}
        </div>
        {(likes > 0 || actions) && (
          <div className="relative z-10 flex shrink-0 items-center gap-2">
            {likes > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground" aria-label={`${likes} ${likes === 1 ? "like" : "likes"}`}>
                <ThumbsUp className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                <span aria-hidden className="font-mono tabular-nums">{likes}</span>
              </span>
            )}
            {actions}
          </div>
        )}
      </div>

      <StatStrip stats={cardStats(card.facts)} size="sm" />

      <PhaseBar
        phases={card.phases}
        totalS={card.facts.totalSeconds}
        markers={sc !== undefined ? [{ s: sc, label: "Second crack" }] : []}
        size="sm"
        ariaLabel=""
      />

      {children}

      <div className="mt-auto flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">{card.roasterLabel}</span>
        <time dateTime={card.createdAt} className="shrink-0">{formatDate(card.createdAt)}</time>
      </div>
    </Wrapper>
  );
}
