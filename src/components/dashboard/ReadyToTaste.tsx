import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

export interface TasteItem {
  id: string;
  bean: string;
  createdAt: string;
}

const DAY = 24 * 60 * 60 * 1000;

/** Roasts rested 1–14 days without a tasting score. */
// eslint-disable-next-line react-refresh/only-export-components
export function readyToTaste<T extends { created_at: string; cupping_score?: number | null }>(rows: T[], now = Date.now()): T[] {
  return rows.filter((r) => {
    if (r.cupping_score !== null && r.cupping_score !== undefined) return false;
    const age = (now - new Date(r.created_at).getTime()) / DAY;
    return age >= 1 && age <= 14;
  });
}

const restLabel = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
  return days === 1 ? "Rested 1 day" : `Rested ${days} days`;
};

export function ReadyToTaste({ items }: { items: TasteItem[] }) {
  if (items.length === 0) return null;
  const shown = items.slice(0, 6);
  return (
    <section aria-labelledby="taste-heading" className="space-y-3">
      <div>
        <h2 id="taste-heading" className="text-xl font-semibold tracking-tight">Ready to taste</h2>
        <p className="text-sm text-muted-foreground">Roasted in the last two weeks, not rated yet.</p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          <li key={item.id}>
            <Link
              to={`/profile/${item.id}#notes`}
              className="flex min-h-14 items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 transition-colors duration-150 hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{item.bean}</span>
                <span className="block text-xs text-muted-foreground">{restLabel(item.createdAt)} · Add tasting notes</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
