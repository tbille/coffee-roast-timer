import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RoastCard, type RoastCardData } from "@/components/roast-card/RoastCard";
import { Skeleton } from "@/components/ui/skeleton";
import { rowToCard, type ProfileRowInput } from "@/utils/roastProfileView";
import { UNNAMED_BEAN } from "@/lib/saveRoast";
import { withVisibilityFallback } from "@/lib/visibility";

const COUNT = 6;

/** Only the columns a card needs; likes counted in the same request. */
const COLUMNS =
  "id, beans_name, origin, farm_name, roast_process, coffee_roaster, roaster_type, duration_seconds, initial_weight, final_weight, crack_events, milestones, roaster_data, roaster_settings, created_at, likes:roast_profile_likes(count)";

async function fetchLatest(): Promise<RoastCardData[]> {
  // Public roasts only; private and link-only roasts never appear in lists.
  const { data, error } = await withVisibilityFallback("latest-roasts", (hasColumn) => {
    const query = supabase.from("roast_profiles").select(COLUMNS);
    return (hasColumn ? query.eq("visibility", "public") : query)
      .order("created_at", { ascending: false })
      .limit(30);
  });
  if (error) throw error;
  return ((data ?? []) as unknown as ProfileRowInput[])
    .map(rowToCard)
    // Keep the homepage to roasts that say something: a named coffee with first crack marked.
    .filter((card) => card.title !== "Untitled roast" && card.title !== UNNAMED_BEAN && card.facts.firstCrack && card.facts.totalSeconds > 0)
    .slice(0, COUNT);
}

export function LatestRoasts() {
  const { data: cards, isLoading, isError } = useQuery({ queryKey: ["latest-roasts", COUNT], queryFn: fetchLatest });

  if (isError || (!isLoading && (!cards || cards.length === 0))) return null;

  return (
    <section aria-labelledby="latest-title" className="border-t px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="latest-title" className="text-2xl font-semibold tracking-tight">
              Latest roasts
            </h2>
            <p className="mt-2 text-muted-foreground">
              Fresh from the community, with the same numbers you'll get: total, first crack, development and loss.
            </p>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Browse all
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={isLoading || undefined}>
          {isLoading
            ? Array.from({ length: COUNT }).map((_, i) => (
                <li key={i} className="space-y-4 rounded-lg border bg-card p-4 sm:p-5" aria-hidden>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-1.5 w-full" />
                </li>
              ))
            : cards!.map((card) => <RoastCard key={card.id} card={card} headingLevel="h3" />)}
        </ul>
      </div>
    </section>
  );
}
