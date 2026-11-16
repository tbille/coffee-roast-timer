import { useState } from "react";
import { useSearchParams } from "react-router";
import { Plus, X } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatClock } from "@/lib/format";
import { PhaseBar } from "@/components/roast-card/PhaseBar";
import { RoastCard } from "@/components/roast-card/RoastCard";
import { useProfileComparison } from "@/hooks/useProfileComparison";
import { COMPARE_COLORS, COMPARE_LABELS, type CompareRoast, type CompareSlot } from "@/types/comparison.types";
import { countBeanReadings, deriveChartPoints } from "@/utils/roastProfileView";
import type { TemperatureUnit } from "@/utils/temperatureConversion";
import { ComparisonChart } from "./ComparisonChart";
import { ComparisonStats } from "./ComparisonStats";
import { ProfileSelector } from "./ProfileSelector";

/** Reads ?a=&b=, falling back to the older ?ids=a,b. */
function useSlotIds() {
  const [params, setParams] = useSearchParams();
  const legacy = (params.get("ids") ?? "").split(",").filter(Boolean);
  const ids = { a: params.get("a") ?? legacy[0] ?? undefined, b: params.get("b") ?? legacy[1] ?? undefined };
  const setSlot = (slot: CompareSlot, id: string | undefined) => {
    const next = { ...ids, [slot]: id };
    const out = new URLSearchParams();
    if (next.a) out.set("a", next.a);
    if (next.b) out.set("b", next.b);
    setParams(out, { replace: true });
  };
  return { ids, setSlot };
}

function Slot({
  slot,
  roast,
  loading,
  missing,
  onPick,
  onClear,
}: {
  slot: CompareSlot;
  roast?: CompareRoast | null;
  loading: boolean;
  missing: boolean;
  onPick: () => void;
  onClear: () => void;
}) {
  const heading = (
    <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      <span className="h-0.5 w-4 rounded" style={{ background: COMPARE_COLORS[slot] }} aria-hidden />
      {COMPARE_LABELS[slot]}
    </p>
  );
  if (loading) {
    return (
      <div>
        {heading}
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }
  if (roast) {
    return (
      <div>
        {heading}
        <RoastCard
          as="div"
          headingLevel="h2"
          card={roast.card}
          actions={
            <>
              <Button variant="ghost" size="sm" onClick={onPick}>Change</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear} aria-label={`Remove ${COMPARE_LABELS[slot]}`}>
                <X strokeWidth={1.75} aria-hidden />
              </Button>
            </>
          }
        />
      </div>
    );
  }
  return (
    <div>
      {heading}
      <button
        type="button"
        onClick={onPick}
        className="flex min-h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-background p-6 text-sm transition-colors hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} aria-hidden />
        <span className="font-medium">Pick a roast</span>
        {missing && <span className="text-xs text-muted-foreground">The linked roast was not found.</span>}
      </button>
    </div>
  );
}

export const ComparisonPage = () => {
  const { ids, setSlot } = useSlotIds();
  const { a, b } = useProfileComparison(ids.a, ids.b);
  const [picking, setPicking] = useState<CompareSlot | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>("C");
  const [align, setAlign] = useState(false);

  const roasts = [a.data, b.data].filter((r): r is CompareRoast => Boolean(r));
  const withReadings = roasts.filter((r) => countBeanReadings(deriveChartPoints(r.row, "C")) >= 3);
  const canAlign = roasts.length > 0 && roasts.every((r) => r.facts.firstCrack);
  const aligned = align && canAlign;
  const timelineScale = Math.max(0, ...roasts.map((r) => r.facts.totalSeconds));

  return (
    <>
      <PageTitle title="Compare roasts" description="Compare two coffee roasts side by side: temperature, first crack, development and weight loss." noIndex />
      <div className="bg-background px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <PageHeader
            title="Compare roasts"
            description="Put two roasts side by side to see where their timing differs."
          />

          <section aria-label="Roasts to compare" className="grid gap-4 md:grid-cols-2">
            {(["a", "b"] as const).map((slot) => {
              const q = slot === "a" ? a : b;
              return (
                <Slot
                  key={slot}
                  slot={slot}
                  roast={q.data}
                  loading={Boolean(ids[slot]) && q.isLoading}
                  missing={Boolean(ids[slot]) && !q.isLoading && !q.data}
                  onPick={() => setPicking(slot)}
                  onClear={() => setSlot(slot, undefined)}
                />
              );
            })}
          </section>

          {(a.isError || b.isError) && (
            <p role="alert" className="text-sm text-destructive">A roast could not be loaded. Check your connection and try again.</p>
          )}

          {roasts.length > 0 && (
            <>
              <section aria-labelledby="compare-curve" className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="compare-curve" className="text-lg font-semibold">
                    {withReadings.length > 0 ? "Temperature" : "Timeline"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch id="align-fc" checked={aligned} onCheckedChange={setAlign} disabled={!canAlign} />
                      <Label htmlFor="align-fc" className="text-sm">Align on first crack</Label>
                    </div>
                    {withReadings.length > 0 && (
                      <ToggleGroup
                        type="single"
                        size="sm"
                        variant="outline"
                        value={unit}
                        onValueChange={(v) => v && setUnit(v as TemperatureUnit)}
                        aria-label="Temperature unit"
                      >
                        <ToggleGroupItem value="C" aria-label="Celsius" className="h-8 px-2.5 font-mono">°C</ToggleGroupItem>
                        <ToggleGroupItem value="F" aria-label="Fahrenheit" className="h-8 px-2.5 font-mono">°F</ToggleGroupItem>
                      </ToggleGroup>
                    )}
                  </div>
                </div>
                {!canAlign && roasts.length > 0 && (
                  <p className="text-xs text-muted-foreground">Aligning needs a first crack mark on every roast.</p>
                )}

                {withReadings.length > 0 && (
                  <>
                    <ComparisonChart roasts={roasts} unit={unit} alignOnFirstCrack={aligned} />
                    {withReadings.length < roasts.length && (
                      <p className="text-xs text-muted-foreground">
                        {roasts
                          .filter((r) => !withReadings.includes(r))
                          .map((r) => COMPARE_LABELS[r.slot])
                          .join(" and ")}{" "}
                        has no temperature readings; its marks are shown on the timeline below.
                      </p>
                    )}
                  </>
                )}

                <div className="space-y-5">
                  {withReadings.length > 0 && <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>}
                  {roasts.map((r) => {
                    // Aligned timelines: shift so both first cracks sit at the same x
                    const maxFc = Math.max(...roasts.map((x) => x.facts.firstCrack?.time ?? 0));
                    const shift = aligned ? maxFc - (r.facts.firstCrack?.time ?? 0) : 0;
                    const scale = aligned
                      ? Math.max(...roasts.map((x) => x.facts.totalSeconds + (maxFc - (x.facts.firstCrack?.time ?? 0))))
                      : timelineScale;
                    const phases = r.phases.map((p) => ({ ...p, start: p.start + shift, end: p.end + shift }));
                    return (
                      <div key={r.slot} className="space-y-2">
                        <p className="flex items-center gap-2 text-sm">
                          <span className="h-0.5 w-4 rounded" style={{ background: COMPARE_COLORS[r.slot] }} aria-hidden />
                          <span className="font-medium">{COMPARE_LABELS[r.slot]}</span>
                          <span className="truncate text-muted-foreground">{r.card.title}</span>
                        </p>
                        <PhaseBar
                          phases={phases}
                          totalS={scale}
                          markers={r.marks
                            .filter((m) => m.kind !== "first_crack" && m.kind !== "yellowing")
                            .map((m) => ({ s: m.s + shift, label: m.label }))}
                          size="md"
                          ariaLabel={`${COMPARE_LABELS[r.slot]}: ${r.marks.map((m) => `${m.label} at ${formatClock(m.s)}`).join(", ") || "no marks"}`}
                        />
                        {r.phases.length === 0 && <p className="text-xs text-muted-foreground">No first crack was marked on this roast.</p>}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section aria-labelledby="compare-numbers" className="space-y-3">
                <h2 id="compare-numbers" className="text-lg font-semibold">Numbers</h2>
                <ComparisonStats a={a.data} b={b.data} />
              </section>
            </>
          )}
        </div>
      </div>

      <ProfileSelector
        open={picking !== null}
        onOpenChange={(open) => !open && setPicking(null)}
        title={picking ? `Pick ${COMPARE_LABELS[picking].toLowerCase()}` : "Pick a roast"}
        excludeId={picking === "a" ? ids.b : picking === "b" ? ids.a : undefined}
        onSelect={(id) => picking && setSlot(picking, id)}
      />
    </>
  );
};
