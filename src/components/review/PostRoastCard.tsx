/**
 * PostRoastCard — Review state of the roast console (replaces SaveRoastDialog).
 * CONTRACT (props are fixed):
 * - Auto-drafts `result` to the device on mount (src/lib/drafts.ts), nothing required.
 * - onDiscard: user confirmed discard (or is done); the console resets to Setup.
 * - onNextBatch: roast saved (or drafted); the console returns to Setup with this roast as the reference.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { AlertTriangle, Check, CloudOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatStrip, type StatItem } from "@/components/roast-card/StatStrip";
import { PhaseBar, type PhaseBarMarker } from "@/components/roast-card/PhaseBar";
import { useAuth } from "@/hooks/useAuth";
import { useBeanNames } from "@/hooks/useMyRoasts";
import { forgetRoast, getDraft, upsertDraft, wasDeleted } from "@/lib/drafts";
import { supabase } from "@/integrations/supabase/client";
import { findEvent, saveRoast } from "@/lib/saveRoast";
import { normaliseOrigin, ORIGIN_SUGGESTIONS } from "@/lib/origins";
import { formatClock, formatClockDelta, formatGrams, formatPercent, msToSeconds, parseLocaleNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  PLACE_LABELS,
  PROCESS_LABELS,
  ROAST_LEVEL_LABELS,
  type ProcessMethod,
  type RoastDetails,
  type RoastDraft,
  type RoastEvent,
  type RoastLevel,
  type RoastPlace,
  type RoastReference,
  type RoastResult,
} from "@/types/roast-session.types";
import { EventTimes } from "./EventTimes";
import { draftFacts, eventInputId, referenceFromDraft, roastAgainHref } from "./draftView";

export interface PostRoastCardProps {
  result: RoastResult;
  /** Reference followed during this roast, to show deltas in the summary */
  reference?: RoastReference | null;
  onDiscard: () => void;
  onNextBatch: (reference: RoastReference) => void;
}

const PROCESS_OPTIONS: ChipOption<ProcessMethod>[] = (Object.keys(PROCESS_LABELS) as ProcessMethod[]).map((value) => ({
  value,
  label: PROCESS_LABELS[value],
}));

/** Light to dark espresso hues for the level swatches. */
const LEVEL_SWATCH: Record<RoastLevel, string> = {
  light: "hsl(34 52% 62%)",
  city: "hsl(30 48% 50%)",
  city_plus: "hsl(27 46% 42%)",
  full_city: "hsl(24 44% 33%)",
  full_city_plus: "hsl(22 40% 25%)",
  dark: "hsl(20 32% 15%)",
};

const LEVEL_OPTIONS: ChipOption<RoastLevel>[] = (Object.keys(ROAST_LEVEL_LABELS) as RoastLevel[]).map((value) => ({
  value,
  label: ROAST_LEVEL_LABELS[value],
  swatch: LEVEL_SWATCH[value],
}));

const PLACE_OPTIONS: ChipOption<RoastPlace>[] = (Object.keys(PLACE_LABELS) as RoastPlace[]).map((value) => ({
  value,
  label: PLACE_LABELS[value],
}));

const AUTOSAVE_MS = 400;

const numText = (n?: number) => (n === undefined || !Number.isFinite(n) ? "" : String(n));

/** Drop time as recorded live (an edited drop keeps it in `editedFromT`). */
const recordedDropT = (r: RoastResult) => {
  const drop = findEvent(r.events, "drop");
  return drop ? (drop.editedFromT ?? drop.t) : undefined;
};

/**
 * The stored draft for this roast, or a new one. A stored draft from before an
 * "Undo drop" (the roast went on and dropped again) keeps its details but takes
 * the new result; `stale` says it must be re-drafted and is not saved as shown.
 */
function initialDraft(result: RoastResult, ownerId: string | undefined): { draft: RoastDraft; stale: boolean } {
  const stored = getDraft(result.id);
  if (stored) {
    const stale =
      recordedDropT(stored.result) !== recordedDropT(result) ||
      stored.result.controlChanges.length !== result.controlChanges.length ||
      stored.result.readings.length !== result.readings.length;
    return { draft: stale ? { ...stored, result } : stored, stale };
  }
  const now = Date.now();
  return {
    draft: {
      result,
      details: { weightInGrams: result.batchGrams > 0 ? result.batchGrams : undefined },
      createdAt: now,
      updatedAt: now,
      ...(ownerId ? { ownerId } : {}),
    },
    stale: false,
  };
}

type SaveState = "idle" | "device" | "cloud" | "error";

export function PostRoastCard({ result, reference, onDiscard, onNextBatch }: PostRoastCardProps) {
  const { user } = useAuth();
  const baseId = useId();
  const beanNames = useBeanNames(user?.id);

  const [initial] = useState(() => initialDraft(result, user?.id));
  const [draft, setDraft] = useState<RoastDraft>(initial.draft);
  const [version, setVersion] = useState(0);
  const savedAsShown = !!initial.draft.syncedAt && !initial.stale;
  const [savedVersion, setSavedVersion] = useState<number | null>(savedAsShown ? 0 : null);
  const [saveState, setSaveState] = useState<SaveState>(savedAsShown ? "cloud" : "idle");
  /** Whether the account already holds this roast (DraftSync may have uploaded it), read when Discard opens. */
  const [discardSynced, setDiscardSynced] = useState(false);
  const [busy, setBusy] = useState<null | "save" | "next">(null);

  const [weightOutText, setWeightOutText] = useState(() => numText(draft.details.weightOutGrams));
  const [weightInText, setWeightInText] = useState(() => numText(draft.details.weightInGrams));
  const [ambientText, setAmbientText] = useState(() => numText(draft.details.ambientC));

  const draftRef = useRef(draft);
  const staleRef = useRef(initial.stale);
  const pending = useRef(false);
  const weightOutRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Drafted on the device the moment the card appears; nothing is required.
  // Never for a roast the person already deleted (its session can outlive the draft).
  useEffect(() => {
    const id = draftRef.current.result.id;
    if ((staleRef.current || !getDraft(id)) && !wasDeleted(id)) upsertDraft(draftRef.current);
    weightOutRef.current?.focus({ preventScroll: true });
  }, []);

  // Debounced autosave of every change; flushed on unmount.
  useEffect(() => {
    if (!pending.current) return;
    const timer = setTimeout(() => {
      upsertDraft(draft);
      pending.current = false;
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [draft]);
  useEffect(
    () => () => {
      if (pending.current) upsertDraft(draftRef.current);
    },
    [],
  );

  const flush = useCallback((): RoastDraft => {
    const current = draftRef.current;
    upsertDraft(current);
    pending.current = false;
    return current;
  }, []);

  const update = (fn: (d: RoastDraft) => RoastDraft) => {
    pending.current = true;
    setDraft((d) => {
      const next = fn(d);
      draftRef.current = next;
      return next;
    });
    setVersion((v) => v + 1);
  };

  const setDetail = <K extends keyof RoastDetails>(key: K, value: RoastDetails[K]) =>
    update((d) => ({ ...d, details: { ...d.details, [key]: value } }));

  const setEvents = (events: RoastEvent[]) =>
    update((d) => {
      const drop = findEvent(events, "drop");
      return {
        ...d,
        result: {
          ...d.result,
          events,
          durationSeconds: drop ? msToSeconds(drop.t) : d.result.durationSeconds,
        },
      };
    });

  // ---- Derived numbers -------------------------------------------------------
  const { details } = draft;
  const totalS = Math.round(draft.result.durationSeconds);
  const { facts, phases } = useMemo(() => draftFacts(draft), [draft]);
  const fcEvent = findEvent(draft.result.events, "first_crack");
  const fcS = fcEvent ? msToSeconds(fcEvent.t) : undefined;
  const scS = facts.secondCrack?.time;

  const weightOut = parseLocaleNumber(weightOutText);
  const weightIn = parseLocaleNumber(weightInText);
  const weightOutBad = weightOutText.trim() !== "" && (weightOut === undefined || weightOut <= 0);
  const weightInBad = weightInText.trim() !== "" && (weightIn === undefined || weightIn <= 0);
  const lossPct = weightIn && weightOut && weightIn > 0 && weightOut > 0 ? ((weightIn - weightOut) / weightIn) * 100 : undefined;
  const outNotLess = weightIn !== undefined && weightOut !== undefined && weightOut >= weightIn;
  const lossUnusual = lossPct !== undefined && !outNotLess && (lossPct < 5 || lossPct > 25);

  const devPct = fcS !== undefined && totalS > 0 ? ((totalS - fcS) / totalS) * 100 : undefined;
  const implausible = fcS !== undefined && devPct !== undefined && (devPct < 5 || devPct > 45);

  const ambientBad = ambientText.trim() !== "" && parseLocaleNumber(ambientText) === undefined;
  const originNormalised = normaliseOrigin(details.origin);
  const originRewritten = !!details.origin?.trim() && originNormalised !== details.origin.trim();

  const delta = (mine?: number, theirs?: number) =>
    reference && mine !== undefined && theirs !== undefined ? `${formatClockDelta(mine - theirs)} vs reference` : undefined;

  const stats: StatItem[] = [
    { key: "total", label: "Total", value: totalS > 0 ? formatClock(totalS) : undefined, sub: delta(totalS, reference?.dropS) },
    { key: "fc", label: "First crack", value: facts.firstCrack ? formatClock(facts.firstCrack.time) : undefined, sub: delta(facts.firstCrack?.time, reference?.firstCrackS) },
    {
      key: "dev",
      label: "Development",
      value: facts.developmentSeconds !== undefined ? formatClock(facts.developmentSeconds) : undefined,
      sub: facts.developmentPercent !== undefined ? formatPercent(facts.developmentPercent) : undefined,
    },
    {
      key: "loss",
      label: "Loss",
      value: lossPct !== undefined && !outNotLess ? formatPercent(lossPct) : undefined,
      sub: weightIn && weightOut ? `${formatGrams(weightIn)} → ${formatGrams(weightOut)}` : undefined,
    },
  ];

  const ghostMarkers: PhaseBarMarker[] = reference
    ? [
        reference.yellowingS !== undefined ? { s: reference.yellowingS, label: "Reference yellowing" } : null,
        reference.firstCrackS !== undefined ? { s: reference.firstCrackS, label: "Reference first crack" } : null,
        { s: reference.dropS, label: "Reference drop" },
      ].filter((m): m is PhaseBarMarker => m !== null)
    : [];

  // ---- Actions -----------------------------------------------------------------
  const dirty = savedVersion === null || version !== savedVersion;
  const savedToCloud = saveState === "cloud" && !dirty;
  const savedOnDevice = saveState === "device" && !dirty;

  const handleSave = async () => {
    const at = version;
    const current = flush();
    if (!user) {
      setSaveState("device");
      setSavedVersion(at);
      return;
    }
    setBusy("save");
    const res = await saveRoast(current, user.id);
    setBusy(null);
    if (res.ok) {
      setSaveState("cloud");
      setSavedVersion(at);
      // The stored stamp is taken before the request, so edits made meanwhile stay unsynced.
      setDraft((d) => ({ ...d, syncedAt: getDraft(d.result.id)?.syncedAt ?? d.syncedAt }));
      toast.success(res.alreadySaved ? "Changes saved" : "Roast saved");
    } else {
      setSaveState("error");
      toast.error("Could not save to your account", { description: "It is still on this device. Try again in a moment." });
    }
  };

  const handleNextBatch = async () => {
    const current = flush();
    let savedId: string | undefined;
    if (user) {
      setBusy("next");
      const res = await saveRoast(current, user.id);
      setBusy(null);
      if (res.ok) savedId = res.id;
      else toast.error("Could not save to your account", { description: "It is kept on this device and used as the reference." });
    }
    onNextBatch(referenceFromDraft(current, savedId));
  };

  const handleDiscard = async () => {
    pending.current = false;
    const id = draft.result.id;
    // DraftSync may have uploaded it in the background: remove it from the account too.
    if (getDraft(id)?.syncedAt && user) {
      setBusy("save");
      const { error } = await supabase.from("roast_profiles").delete().eq("id", id).eq("user_id", user.id);
      setBusy(null);
      if (error) {
        toast.error("Could not delete the roast from your account", { description: "Check your connection and try again." });
        return;
      }
    }
    forgetRoast(id);
    onDiscard();
  };

  const focusFirstCrack = () => {
    const el = document.getElementById(eventInputId(baseId, "first_crack")) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };

  const ids = {
    heading: `${baseId}-heading`,
    out: `${baseId}-weight-out`,
    outHelp: `${baseId}-weight-out-help`,
    outFlag: `${baseId}-weight-out-flag`,
    in: `${baseId}-weight-in`,
    inError: `${baseId}-weight-in-error`,
    bean: `${baseId}-bean`,
    beans: `${baseId}-beans`,
    origin: `${baseId}-origin`,
    origins: `${baseId}-origins`,
    originHint: `${baseId}-origin-hint`,
    ambient: `${baseId}-ambient`,
    ambientError: `${baseId}-ambient-error`,
    notes: `${baseId}-notes`,
    saveNote: `${baseId}-save-note`,
  };

  const refId = savedToCloud ? draft.result.id : `local:${draft.result.id}`;

  return (
    <section aria-labelledby={ids.heading} className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Roast finished</p>
        <h2 id={ids.heading} className="text-2xl font-semibold tracking-tight">
          Review this roast
        </h2>
        <p className="text-sm text-muted-foreground">Already kept on this device. Add what you know; every field is optional.</p>
      </header>

      {/* Summary */}
      <div className="space-y-5 rounded-lg border bg-card p-4 sm:p-6">
        <StatStrip stats={stats} size="md" columns={4} />
        <PhaseBar
          phases={phases}
          totalS={Math.max(totalS, reference?.dropS ?? 0)}
          markers={scS !== undefined ? [{ s: scS, label: "Second crack" }] : []}
          ghostMarkers={ghostMarkers}
          size="md"
          showLegend
        />
        {reference && (
          <p className="text-xs text-muted-foreground">
            Dashed ticks: <span className="text-foreground">{reference.name}</span>, the roast you followed.
          </p>
        )}
      </div>

      {implausible && fcS !== undefined && (
        <div className="flex flex-col gap-3 rounded-lg border border-warning/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
            <span>
              First crack at <span className="font-mono tabular-nums">{formatClock(fcS)}</span> in a{" "}
              <span className="font-mono tabular-nums">{formatClock(totalS)}</span> roast — fix the time?
            </span>
          </p>
          <Button type="button" variant="outline" className="h-11 shrink-0" onClick={focusFirstCrack}>
            Fix the time
          </Button>
        </div>
      )}

      <EventTimes baseId={baseId} events={draft.result.events} onChange={setEvents} />

      {/* Weights */}
      <div className="grid gap-6 sm:grid-cols-[3fr_2fr]">
        <div className="space-y-2">
          <label htmlFor={ids.out} className="text-sm font-medium">
            Weight out (g)
          </label>
          <Input
            ref={weightOutRef}
            id={ids.out}
            value={weightOutText}
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 212"
            aria-invalid={weightOutBad || outNotLess || undefined}
            aria-describedby={cn(ids.outHelp, (weightOutBad || outNotLess || lossUnusual) && ids.outFlag)}
            onChange={(e) => {
              setWeightOutText(e.target.value);
              setDetail("weightOutGrams", parseLocaleNumber(e.target.value));
            }}
            className={cn("h-14 font-mono text-2xl tabular-nums md:text-2xl", (weightOutBad || outNotLess) && "border-destructive")}
          />
          <p id={ids.outHelp} className="text-sm text-muted-foreground">
            {lossPct !== undefined && !outNotLess ? (
              <>
                Loss <span className="font-mono tabular-nums text-foreground">{formatPercent(lossPct)}</span> · Typical: 12–20%
              </>
            ) : (
              "Typical loss: 12–20%"
            )}
          </p>
          {weightOutBad ? (
            <p id={ids.outFlag} className="text-sm text-destructive">Enter grams, e.g. 212 or 212,5.</p>
          ) : outNotLess ? (
            <p id={ids.outFlag} className="text-sm text-destructive">Weight out should be less than weight in.</p>
          ) : lossUnusual ? (
            <p id={ids.outFlag} className="text-sm text-warning">
              A <span className="font-mono tabular-nums">{formatPercent(lossPct)}</span> loss is unusual. Check both weights?
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor={ids.in} className="text-sm font-medium">
            Weight in (g)
          </label>
          <Input
            id={ids.in}
            value={weightInText}
            inputMode="decimal"
            autoComplete="off"
            aria-invalid={weightInBad || undefined}
            aria-describedby={weightInBad ? ids.inError : undefined}
            onChange={(e) => {
              setWeightInText(e.target.value);
              setDetail("weightInGrams", parseLocaleNumber(e.target.value));
            }}
            className={cn("h-14 font-mono text-2xl tabular-nums md:text-2xl", weightInBad && "border-destructive")}
          />
          {weightInBad && (
            <p id={ids.inError} className="text-sm text-destructive">Enter grams, e.g. 250.</p>
          )}
        </div>
      </div>

      {/* Coffee */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={ids.bean} className="text-sm font-medium">
            Bean
          </label>
          <Input
            id={ids.bean}
            value={details.beanName ?? ""}
            list={ids.beans}
            autoComplete="off"
            placeholder="e.g. Ethiopia Guji natural"
            maxLength={120}
            onChange={(e) => setDetail("beanName", e.target.value)}
            className="h-11"
          />
          <datalist id={ids.beans}>
            {beanNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <label htmlFor={ids.origin} className="text-sm font-medium">
            Origin
          </label>
          <Input
            id={ids.origin}
            value={details.origin ?? ""}
            list={ids.origins}
            autoComplete="off"
            placeholder="Country or region"
            maxLength={80}
            aria-describedby={originRewritten ? ids.originHint : undefined}
            onChange={(e) => setDetail("origin", e.target.value)}
            className="h-11"
          />
          <datalist id={ids.origins}>
            {ORIGIN_SUGGESTIONS.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {originRewritten && (
            <p id={ids.originHint} className="text-sm text-muted-foreground">
              Saved as <span className="text-foreground">{originNormalised}</span>
            </p>
          )}
        </div>
      </div>

      <ChipGroup
        label="Process"
        options={PROCESS_OPTIONS}
        value={details.process ?? null}
        onChange={(v) => setDetail("process", v ?? undefined)}
        allowDeselect
        size="lg"
      />

      <ChipGroup
        label="Roast level"
        options={LEVEL_OPTIONS}
        value={details.roastLevel ?? null}
        onChange={(v) => setDetail("roastLevel", v ?? undefined)}
        allowDeselect
        size="lg"
      />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <ChipGroup
          label="Where"
          options={PLACE_OPTIONS}
          value={details.place ?? null}
          onChange={(v) => setDetail("place", v ?? undefined)}
          allowDeselect
          size="lg"
        />
        <div className="space-y-2">
          <label htmlFor={ids.ambient} className="text-sm font-medium">
            Ambient °C <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id={ids.ambient}
            value={ambientText}
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 14"
            aria-invalid={ambientBad || undefined}
            aria-describedby={ambientBad ? ids.ambientError : undefined}
            onChange={(e) => {
              setAmbientText(e.target.value);
              setDetail("ambientC", parseLocaleNumber(e.target.value));
            }}
            className={cn("h-12 w-full font-mono tabular-nums sm:w-28", ambientBad && "border-destructive")}
          />
          {ambientBad && (
            <p id={ids.ambientError} className="text-sm text-destructive">Enter a number, e.g. 14.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={ids.notes} className="text-sm font-medium">
          Notes
        </label>
        <Textarea
          id={ids.notes}
          value={details.notes ?? ""}
          rows={4}
          placeholder="What you saw, heard and smelled. What you would change next time."
          onChange={(e) => setDetail("notes", e.target.value)}
          className="min-h-28"
        />
      </div>

      {/* Actions */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="space-y-2 sm:flex-1">
            <Button
              type="button"
              size="lg"
              className="h-12 w-full sm:w-auto"
              onClick={handleSave}
              disabled={busy !== null || savedToCloud || savedOnDevice}
              aria-describedby={ids.saveNote}
            >
              {busy === "save" ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} aria-hidden />
              ) : savedToCloud || savedOnDevice ? (
                <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              ) : null}
              {savedToCloud || savedOnDevice ? "Saved" : saveState === "cloud" || saveState === "device" ? "Save changes" : "Save"}
            </Button>
            <p id={ids.saveNote} className="text-xs text-muted-foreground">
              Saved roasts are visible on Discover.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12"
            onClick={handleNextBatch}
            disabled={busy !== null}
          >
            {busy === "next" && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} aria-hidden />}
            Next batch
          </Button>
          {savedToCloud || savedOnDevice ? (
            <Button type="button" variant="ghost" size="lg" className="h-12 hover:bg-muted" onClick={onDiscard} disabled={busy !== null}>
              Done
            </Button>
          ) : (
            <AlertDialog onOpenChange={(open) => open && setDiscardSynced(!!getDraft(draft.result.id)?.syncedAt)}>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="h-12 text-destructive hover:bg-muted hover:text-destructive"
                  disabled={busy !== null}
                >
                  Discard
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard this roast?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {discardSynced && user
                      ? "The roast is removed from this device. This also deletes it from your account and Discover. This cannot be undone."
                      : discardSynced
                        ? "The roast is removed from this device. The copy saved to your account stays there."
                        : "The roast and everything typed here is removed from this device. This cannot be undone."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDiscard}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Discard
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div role="status" aria-live="polite" className="text-sm">
          {savedToCloud && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5 font-medium text-success">
                <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Saved
              </span>
              <span aria-hidden className="text-muted-foreground">·</span>
              <Link to={`/profile/${draft.result.id}`} className="underline underline-offset-4 hover:text-primary">
                View roast
              </Link>
              <span aria-hidden className="text-muted-foreground">·</span>
              <Link to={roastAgainHref(draft.result.roasterType, refId)} className="underline underline-offset-4 hover:text-primary">
                Roast again
              </Link>
            </p>
          )}
          {savedOnDevice && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5 font-medium">
                <CloudOff className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
                Saved on this device
              </span>
              <span aria-hidden className="text-muted-foreground">·</span>
              <Link to="/auth?next=/roasts" className="underline underline-offset-4 hover:text-primary">
                Sign in to sync and share
              </Link>
              <span aria-hidden className="text-muted-foreground">·</span>
              <Link to={roastAgainHref(draft.result.roasterType, refId)} className="underline underline-offset-4 hover:text-primary">
                Roast again
              </Link>
            </p>
          )}
          {saveState === "error" && dirty && (
            <p className="text-destructive">Not saved to your account yet. It is still on this device.</p>
          )}
        </div>
      </div>
    </section>
  );
}
