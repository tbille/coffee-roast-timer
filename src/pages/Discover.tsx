import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Helmet } from "react-helmet-async";
import { JsonLd } from "@/components/JsonLd";
import { Coffee, Search, X } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoastCard } from "@/components/roast-card/RoastCard";
import { useDiscoverRows, type DiscoverRow } from "@/components/discover/useDiscoverRows";
import { cn } from "@/lib/utils";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import type { RoasterType } from "@/types/roaster.types";

type SortKey = "newest" | "liked" | "shortest" | "longest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "liked", label: "Most liked" },
  { value: "shortest", label: "Shortest roast" },
  { value: "longest", label: "Longest roast" },
];

const UNKNOWN_ROASTER = "unknown";
const PAGE_SIZE = 24;

const SORTERS: Record<SortKey, (a: DiscoverRow, b: DiscoverRow) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  liked: (a, b) => (b.likes ?? 0) - (a.likes ?? 0) || b.createdAt.localeCompare(a.createdAt),
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
    name: "Discover roasts",
    url: "https://roast-timer.com/discover",
    description: "Community coffee roasts from home roasters with first crack timing, development and weight loss.",
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

  const { data: rows = [], isLoading, isError, refetch } = useDiscoverRows();

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

  // Paginate 24 at a time; any change of filter or sort starts again from the top.
  const filterKey = `${query}|${roaster}|${sort}`;
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [limitKey, setLimitKey] = useState(filterKey);
  if (limitKey !== filterKey) {
    setLimitKey(filterKey);
    setLimit(PAGE_SIZE);
  }
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return rows
      .filter((r) => roaster === "all" || (r.roasterType ?? UNKNOWN_ROASTER) === roaster)
      .filter((r) => terms.every((t) => r.searchText.includes(t)))
      .sort(SORTERS[sort]);
  }, [rows, query, roaster, sort]);

  const visible = results.slice(0, limit);
  const remaining = results.length - visible.length;

  const showMore = () => {
    const firstNew = visible.length;
    setLimit((n) => n + PAGE_SIZE);
    // Move focus to the first newly shown card so keyboard users keep their place
    requestAnimationFrame(() => {
      listRef.current?.querySelectorAll<HTMLAnchorElement>("li a")[firstNew]?.focus();
    });
  };

  const hasFilters = query.trim().length > 0 || roaster !== "all";
  const isNonCanonical = hasFilters || sort !== "newest";

  const chipClass = (active: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
      active ? "border-foreground bg-foreground text-background" : "bg-background text-foreground hover:bg-muted",
    );

  return (
    <>
      <PageTitle
        title="Discover roasts"
        description="Browse real coffee roasts shared by home roasters, by machine, origin and process. Compare first crack timing, development and weight loss before your next batch."
      />
      <Helmet>
        <meta name="keywords" content="coffee roast profiles, community roasts, home coffee roasting, Gene Cafe roasts, FreshRoast roasts, Behmor roasts" />
        <meta name="robots" content={isNonCanonical ? "noindex, follow" : "index, follow"} />
        <meta property="og:title" content="Discover roasts · Roast Timer" />
        <meta property="og:description" content="Real home coffee roasts with first crack, development and weight loss you can roast again." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roast-timer.com/discover" />
        <link rel="canonical" href="https://roast-timer.com/discover" />
      </Helmet>
      <JsonLd data={collectionSchema} />

      <div className="bg-background px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <PageHeader
            title="Discover roasts"
            description="Real roasts shared by home roasters. Compare first crack, development and weight loss on your machine, then open one and roast it again."
          />

          {/* Controls */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Label htmlFor="discover-search" className="sr-only">Search roasts</Label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} aria-hidden />
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
                  <span className="font-mono text-xs tabular-nums opacity-70">{rows.length}</span>
                </button>
                {roasterChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className={chipClass(roaster === chip.id)}
                    aria-pressed={roaster === chip.id}
                    onClick={() => updateParam("roaster", roaster === chip.id ? "all" : chip.id, "all")}
                  >
                    {chip.label}
                    <span className="font-mono text-xs tabular-nums opacity-70">{chip.count}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex min-h-8 items-center justify-between gap-3 text-sm text-muted-foreground">
              <p aria-live="polite">
                {isLoading
                  ? "Loading roasts…"
                  : `${remaining > 0 ? `Showing ${visible.length} of ` : ""}${results.length} ${results.length === 1 ? "roast" : "roasts"}${hasFilters ? ` (${rows.length} in total)` : ""}`}
              </p>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
                  <X className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
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
              <h2 className="text-lg font-semibold">Roasts could not be loaded</h2>
              <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-lg border bg-card px-6 py-12 text-center">
              <Coffee className="mx-auto mb-4 h-8 w-8 text-muted-foreground" strokeWidth={1.75} aria-hidden />
              <h2 className="text-lg font-semibold">{hasFilters ? "No roasts match" : "No roasts yet"}</h2>
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
            <>
              <ul ref={listRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((card) => <RoastCard key={card.id} card={card} />)}
              </ul>
              {remaining > 0 && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <Button variant="outline" onClick={showMore}>
                    Show more
                  </Button>
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">
                    {visible.length} of {results.length}
                  </p>
                </div>
              )}
            </>
          )}

          <nav aria-labelledby="discover-guides" className="mt-10 border-t pt-6">
            <h2 id="discover-guides" className="text-sm font-semibold text-foreground">Reading these numbers</h2>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <li><Link to="/how-to/first-crack-timing" className="text-primary hover:underline">First crack timing</Link></li>
              <li><Link to="/how-to/development-ratios" className="text-primary hover:underline">Development ratios</Link></li>
              <li><Link to="/how-to/roast-defects" className="text-primary hover:underline">Roast defect diagnosis</Link></li>
              <li><Link to="/how-to/using-profiles" className="text-primary hover:underline">Roasting again from a saved roast</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Discover;
