import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RoastCard } from "@/components/roast-card/RoastCard";
import { useDiscoverRows, useOwnRoastRows } from "@/components/discover/useDiscoverRows";
import { useAuth } from "@/hooks/useAuth";

const PAGE_SIZE = 24;

interface ProfileSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the chosen roast id; the sheet closes itself */
  onSelect: (id: string) => void;
  /** Title, e.g. "Pick roast A" */
  title?: string;
  /** Roast already in the other slot (shown as unavailable) */
  excludeId?: string;
}

/** Picks one roast for a compare slot: search, mine/all, RoastCards. */
export const ProfileSelector = ({ open, onOpenChange, onSelect, title = "Pick a roast", excludeId }: ProfileSelectorProps) => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "mine">("all");
  const mine = scope === "mine" && !!user;
  // "All roasts" lists public roasts; "My roasts" lists every roast of the account, private ones included.
  const publicRows = useDiscoverRows(open && !mine);
  const ownRows = useOwnRoastRows(user?.id, open && mine);
  const { data: rows = [], isLoading, isError, refetch } = mine ? ownRows : publicRows;
  const [limit, setLimit] = useState(PAGE_SIZE);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return rows
      .filter((r) => r.id !== excludeId)
      .filter((r) => terms.every((t) => r.searchText.includes(t)));
  }, [rows, query, excludeId]);

  const visible = results.slice(0, limit);

  const choose = (id: string) => {
    onSelect(id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-4 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Any of your roasts, or a public one from the community.</SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          <div className="relative">
            <Label htmlFor="compare-search" className="sr-only">Search roasts</Label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            <Input
              id="compare-search"
              type="search"
              placeholder="Search bean, origin, process or roaster"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              className="pl-9"
            />
          </div>
          {user && (
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={scope}
              onValueChange={(v) => {
                if (!v) return;
                setScope(v as "all" | "mine");
                setLimit(PAGE_SIZE);
              }}
              aria-label="Which roasts"
              className="justify-start"
            >
              <ToggleGroupItem value="all" className="px-3">All roasts</ToggleGroupItem>
              <ToggleGroupItem value="mine" className="px-3">My roasts</ToggleGroupItem>
            </ToggleGroup>
          )}
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {isLoading ? "Loading roasts…" : `${results.length} ${results.length === 1 ? "roast" : "roasts"}`}
          </p>
        </div>

        <div className="-mx-6 flex-1 overflow-y-auto px-6 pb-6">
          {isError ? (
            <div className="rounded-lg border p-6 text-center text-sm">
              <p>Roasts could not be loaded.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {visible.map((card) => (
                  <RoastCard key={card.id} card={card} href={null} headingLevel="h3">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => choose(card.id)}>
                      Compare this roast<span className="sr-only">: {card.title}</span>
                    </Button>
                  </RoastCard>
                ))}
              </ul>
              {results.length > visible.length && (
                <div className="mt-4 flex justify-center">
                  <Button variant="ghost" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
                    Show more <span className="ml-1 font-mono text-xs tabular-nums text-muted-foreground">{visible.length} of {results.length}</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
