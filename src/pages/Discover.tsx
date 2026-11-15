import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Coffee, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DiscoverProfileCard, type DiscoverCardData } from "@/components/discover/DiscoverProfileCard";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { deriveRoastFacts, deriveRoastPhases, type ProfileViewInput } from "@/utils/roastProfileView";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import { getRoasterPrimaryColor } from "@/utils/roasterColors";
import { tidyLabel } from "@/utils/textDisplay";
import type { RoasterType } from "@/types/roaster.types";

type SortKey = "newest" | "liked" | "shortest" | "longest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "liked", label: "Most liked" },
  { value: "shortest", label: "Shortest roast" },
  { value: "longest", label: "Longest roast" },
];

const UNKNOWN_ROASTER = "unknown";

interface DiscoverRow extends DiscoverCardData {
  searchText: string;
}

/** Only the columns the cards need: no temperature curves, likes counted in the same request. */
const PROFILE_COLUMNS =
  "id, beans_name, origin, farm_name, roast_process, coffee_roaster, roaster_type, duration_seconds, initial_weight, final_weight, crack_events, milestones, roaster_data, created_at, likes:roast_profile_likes(count)";

async function fetchDiscoverRows(): Promise<DiscoverRow[]> {
  const { data, error } = await supabase
    .from("roast_profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const profile = row as unknown as ProfileViewInput & {
      id: string;
      beans_name: string;
      origin?: string | null;
      farm_name?: string | null;
      roast_process?: string | null;
      coffee_roaster?: string | null;
      created_at: string;
      likes?: { count: number }[];
    };
    const facts = deriveRoastFacts(profile);
    const roasterType = profile.roaster_type && ROASTER_SPECS[profile.roaster_type as RoasterType]
      ? (profile.roaster_type as RoasterType)
      : undefined;
    const origin = tidyLabel(profile.origin);
    const farm = tidyLabel(profile.farm_name);
    const details = [origin, tidyLabel(profile.roast_process), farm && farm.toLowerCase() !== origin.toLowerCase() ? farm : ""]
      .filter(Boolean);
    const roasterLabel = roasterType ? ROASTER_SPECS[roasterType].displayName : "Roaster not specified";

    return {
      id: profile.id,
      title: tidyLabel(profile.beans_name) || "Untitled roast",
      details,
      roasterType,
      roasterLabel,
      createdAt: profile.created_at,
      likes: profile.likes?.[0]?.count ?? 0,
      facts,
      phases: deriveRoastPhases(profile, facts),
      searchText: [profile.beans_name, profile.origin, profile.farm_name, profile.roast_process, profile.coffee_roaster, roasterLabel]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });
}

const SORTERS: Record<SortKey, (a: DiscoverRow, b: DiscoverRow) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  liked: (a, b) => b.likes - a.likes || b.createdAt.localeCompare(a.createdAt),
  shortest: (a, b) => a.facts.totalSeconds - b.facts.totalSeconds,
  longest: (a, b) => b.facts.totalSeconds - a.facts.totalSeconds,
};

function CardSkeleton() {
  return (
    <li className="space-y-4 rounded-lg border bg-card p-4 sm:p-5" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      <Skeleton className="h-1.5 w-full" />
      <Skeleton className="h-3 w-1/3" />
    </li>
  );
}

const Discover = () => {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Discover Roast Profiles",
    url: "https://roast-timer.com/discover",
    description: "Community coffee roast profiles with first crack timing, development ratio, and weight loss.",
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const roaster = searchParams.get("roaster") ?? "all";
  const sortParam = searchParams.get("sort") as SortKey | null;
  const sort: SortKey = sortParam && sortParam in SORTERS ? sortParam : "newest";

  const updateParam = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value.trim() || value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };
  const clearFilters = () => {
    const next = new URLSearchParams();
    if (sort !== "newest") next.set("sort", sort);
    setSearchParams(next, { replace: true });
  };

  const { data: rows = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["discover-profiles"],
    queryFn: fetchDiscoverRows,
  });

  // Roaster chips: only machines that actually have profiles, most used first.
  const roasterChips = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((r) => counts.set(r.roasterType ?? UNKNOWN_ROASTER, (counts.get(r.roasterType ?? UNKNOWN_ROASTER) ?? 0) + 1));
    return [...counts.entries()]
      .map(([id, count]) => ({
        id,
        count,
        label: id === UNKNOWN_ROASTER ? "Not specified" : ROASTER_SPECS[id as RoasterType].displayName,
      }))
      .sort((a, b) => (a.id === UNKNOWN_ROASTER ? 1 : b.id === UNKNOWN_ROASTER ? -1 : b.count - a.count));
  }, [rows]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return rows
      .filter((r) => roaster === "all" || (r.roasterType ?? UNKNOWN_ROASTER) === roaster)
      .filter((r) => terms.every((t) => r.searchText.includes(t)))
      .sort(SORTERS[sort]);
  }, [rows, query, roaster, sort]);

  const hasFilters = query.trim().length > 0 || roaster !== "all";
  const isNonCanonical = hasFilters || sort !== "newest";

  const chipClass = (active: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
      active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
    );

  return (
    <>
      <Helmet>
        <title>Discover Coffee Roast Profiles by Roaster, Origin, and Process</title>
        <meta name="description" content="Browse community coffee roast profiles by roaster type, bean origin, and process. Compare first crack timing, development ratio, and weight loss before your next batch." />
        <meta name="keywords" content="coffee roast profiles, community roasts, coffee roasting inspiration, roast discovery, shared roast profiles" />
        <meta name="robots" content={isNonCanonical ? "noindex, follow" : "index, follow"} />
        <meta property="og:title" content="Discover Coffee Roast Profiles by Roaster, Origin, and Process" />
        <meta property="og:description" content="Find community roast profiles with useful timing and roast details you can replicate." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roast-timer.com/discover" />
        <link rel="canonical" href="https://roast-timer.com/discover" />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      </Helmet>

      <div className="bg-background px-4 py-6 sm:py-8">
        <div className="container mx-auto w-full max-w-6xl">
          <header className="mb-6 max-w-3xl">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Discover roast profiles</h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Real roasts shared by the community. Compare first crack, development and weight loss on your machine, then
              open a profile to follow its steps.
            </p>
          </header>

          {/* Controls */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Label htmlFor="discover-search" className="sr-only">Search roast profiles</Label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="discover-search"
                  type="search"
                  placeholder="Search bean, origin, farm or process"
                  value={query}
                  onChange={(e) => updateParam("q", e.target.value, "")}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 sm:w-52">
                <Label htmlFor="discover-sort" className="shrink-0 text-sm text-muted-foreground">Sort</Label>
                <Select value={sort} onValueChange={(v) => updateParam("sort", v, "newest")}>
                  <SelectTrigger id="discover-sort" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {roasterChips.length > 0 && (
              <div role="group" aria-label="Filter by roaster" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                <button type="button" className={chipClass(roaster === "all")} aria-pressed={roaster === "all"} onClick={() => updateParam("roaster", "all", "all")}>
                  All roasters
                  <span className="tabular-nums opacity-70">{rows.length}</span>
                </button>
                {roasterChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className={chipClass(roaster === chip.id)}
                    aria-pressed={roaster === chip.id}
                    onClick={() => updateParam("roaster", roaster === chip.id ? "all" : chip.id, "all")}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: chip.id === UNKNOWN_ROASTER ? "hsl(var(--muted-foreground))" : getRoasterPrimaryColor(chip.id as RoasterType) }}
                      aria-hidden
                    />
                    {chip.label}
                    <span className="tabular-nums opacity-70">{chip.count}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex min-h-8 items-center justify-between gap-3 text-sm text-muted-foreground">
              <p aria-live="polite">
                {isLoading ? "Loading profiles…" : `${results.length} ${results.length === 1 ? "profile" : "profiles"}${hasFilters ? ` of ${rows.length}` : ""}`}
              </p>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </ul>
          ) : isError ? (
            <div className="rounded-lg border bg-card px-6 py-12 text-center">
              <h2 className="text-lg font-semibold">Couldn't load roast profiles</h2>
              <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-lg border bg-card px-6 py-12 text-center">
              <Coffee className="mx-auto mb-4 h-10 w-10 text-muted-foreground" aria-hidden />
              <h2 className="text-lg font-semibold">{hasFilters ? "No profiles match" : "No roast profiles yet"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters ? "Try a broader search or another roaster." : "Roast a batch and share it to start the collection."}
              </p>
              {hasFilters ? (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button>
              ) : (
                <Button asChild className="mt-4"><Link to="/roast">Start a roast</Link></Button>
              )}
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((card) => <DiscoverProfileCard key={card.id} card={card} />)}
            </ul>
          )}

          <nav aria-labelledby="discover-guides" className="mt-10 border-t pt-6">
            <h2 id="discover-guides" className="text-sm font-semibold text-foreground">Reading these numbers</h2>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <li><Link to="/how-to/first-crack-timing" className="text-primary hover:underline">First crack timing</Link></li>
              <li><Link to="/how-to/development-ratios" className="text-primary hover:underline">Development ratios</Link></li>
              <li><Link to="/how-to/roast-defects" className="text-primary hover:underline">Roast defect diagnosis</Link></li>
              <li><Link to="/how-to/using-profiles" className="text-primary hover:underline">Using profiles as reference</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Discover;
