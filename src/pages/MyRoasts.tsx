/**
 * My roasts (/roasts). Works signed-out: roasts kept on this device are listed
 * and can be continued; signing in syncs them to the account.
 */
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { CloudOff, Coffee, Download, GitCompare, Loader2, RefreshCw } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RoastCard } from "@/components/roast-card/RoastCard";
import { PostRoastCard } from "@/components/review/PostRoastCard";
import { draftFacts, draftTitle, draftToCard, roastAgainHref } from "@/components/review/draftView";
import { RoasterFilter, ALL_ROASTERS, UNKNOWN_ROASTER } from "@/components/dashboard/RoasterFilter";
import { TrendStrip, type TrendPoint } from "@/components/dashboard/TrendStrip";
import { ReadyToTaste, readyToTaste } from "@/components/dashboard/ReadyToTaste";
import { RoastActions } from "@/components/dashboard/RoastActions";
import { VisibilityBadge } from "@/components/visibility/Visibility";
import { rowVisibility } from "@/lib/visibility";
import { beanKey, rowToCard, rowTrendPoint } from "@/components/dashboard/roastRows";
import { useAuth } from "@/hooks/useAuth";
import { useDrafts } from "@/hooks/useDrafts";
import { useMyRoasts, type MyRoastRow } from "@/hooks/useMyRoasts";
import { forgetRoast } from "@/lib/drafts";
import { syncPendingDrafts } from "@/lib/saveRoast";
import { exportRoastsCsv, exportRoastsJson } from "@/lib/exportRoasts";
import { VISIBILITY_LABELS, type RoastDraft, type RoastVisibility } from "@/types/roast-session.types";

const SIGN_IN_HREF = "/auth?next=/roasts";

const matchesRoaster = (filter: string, type: string | null | undefined) =>
  filter === ALL_ROASTERS || (type || UNKNOWN_ROASTER) === filter;

type DeleteTarget = { kind: "row"; id: string; title: string } | { kind: "draft"; id: string; title: string };

export default function MyRoasts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const drafts = useDrafts();
  const { rows, loading, error, refresh, remove, setVisibility } = useMyRoasts(user?.id);
  const [roaster, setRoaster] = useState<string>(ALL_ROASTERS);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [continueId, setContinueId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const draftsRef = useRef<HTMLElement>(null);

  // Roasts not in the account yet (synced copies only serve "Roast again" from this device).
  // On a shared browser, only show drafts nobody owns or that belong to the signed-in person.
  const deviceDrafts = useMemo(
    () => drafts.filter((d) => !d.syncedAt && (!d.ownerId || d.ownerId === user?.id)),
    [drafts, user?.id],
  );
  const continuing = continueId ? drafts.find((d) => d.result.id === continueId) : undefined;

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) {
      const k = r.roaster_type || UNKNOWN_ROASTER;
      c[k] = (c[k] ?? 0) + 1;
    }
    return c;
  }, [rows]);

  const filteredRows = useMemo(() => rows.filter((r) => matchesRoaster(roaster, r.roaster_type)), [rows, roaster]);

  const trend: TrendPoint[] = useMemo(() => {
    const fromRows = filteredRows.map(rowTrendPoint);
    const fromDrafts = deviceDrafts
      .filter((d) => matchesRoaster(roaster, d.result.roasterType))
      .map((d): TrendPoint => {
        const { facts } = draftFacts(d);
        const dev = facts.developmentPercent;
        return {
          at: new Date(d.result.chargedAt).toISOString(),
          firstCrackS: facts.firstCrack?.time,
          devPercent: dev !== undefined && dev >= 3 && dev <= 50 ? dev : undefined,
          lossPercent: facts.weightLossPercent,
        };
      });
    return [...fromRows, ...fromDrafts];
  }, [filteredRows, deviceDrafts, roaster]);

  const groups = useMemo(() => {
    const map = new Map<string, { title: string; rows: MyRoastRow[] }>();
    for (const row of filteredRows) {
      const key = beanKey(row.beans_name);
      const group = map.get(key);
      if (group) group.rows.push(row);
      else map.set(key, { title: row.beans_name?.trim() || "Unnamed bean", rows: [row] });
    }
    // Rows arrive newest first, so groups keep the order of their latest roast.
    return [...map.entries()].map(([key, g]) => ({ key, ...g }));
  }, [filteredRows]);

  const tasting = useMemo(
    () => readyToTaste(rows).map((r) => ({ id: r.id, bean: r.beans_name?.trim() || "Unnamed bean", createdAt: r.created_at })),
    [rows],
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    if (target.kind === "draft") {
      forgetRoast(target.id);
      if (continueId === target.id) setContinueId(null);
      return;
    }
    const ok = await remove(target.id);
    if (ok) {
      forgetRoast(target.id);
      toast.success("Roast deleted");
    } else {
      toast.error("Could not delete the roast", { description: "Check your connection and try again." });
    }
  };

  const changeVisibility = async (id: string, next: RoastVisibility) => {
    const res = await setVisibility(id, next);
    if ("error" in res) toast.error("Visibility could not be changed", { description: res.error });
    else toast.success(`Visibility: ${VISIBILITY_LABELS[next]}`);
  };

  const syncNow = async () => {
    if (!user) return;
    setSyncing(true);
    const { saved, failed } = await syncPendingDrafts(user.id);
    setSyncing(false);
    if (saved > 0) toast.success(saved === 1 ? "1 roast saved to your account" : `${saved} roasts saved to your account`);
    if (failed > 0) toast.error("Some roasts could not be saved", { description: "They are still on this device." });
    void refresh();
  };

  const startContinue = (draft: RoastDraft) => {
    setContinueId(draft.result.id);
    requestAnimationFrame(() => draftsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const hasAnything = rows.length > 0 || deviceDrafts.length > 0;
  const showLoading = authLoading || (!!user && loading && rows.length === 0);

  const actions = hasAnything ? (
    <>
      <Button variant="outline" className="h-11" onClick={() => toast.success(`Exported ${exportRoastsCsv(rows, deviceDrafts)} roasts`)}>
        <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        Export CSV
      </Button>
      <Button variant="outline" className="h-11" onClick={() => toast.success(`Exported ${exportRoastsJson(rows, deviceDrafts)} roasts`)}>
        <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        Export JSON
      </Button>
      {user && rows.length >= 2 && (
        <Button asChild variant="outline" className="h-11">
          <Link to="/compare">
            <GitCompare className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Compare
          </Link>
        </Button>
      )}
    </>
  ) : undefined;

  return (
    <>
      <PageTitle title="My roasts" noIndex />
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
        <PageHeader
          title="My roasts"
          description={user ? "Every batch you saved, grouped by bean." : "Roasts on this device. Sign in to keep them in your account."}
          actions={actions}
          className="pb-0"
        />

        {showLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading your roasts">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-56 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {!user && (
              <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-2 text-sm">
                  <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
                  <span>These roasts live only in this browser. Sign in to sync and share them.</span>
                </p>
                <Button asChild className="h-11 shrink-0">
                  <Link to={SIGN_IN_HREF}>Sign in to sync and share</Link>
                </Button>
              </div>
            )}

            {(deviceDrafts.length > 0 || continuing) && (
              <section ref={draftsRef} aria-labelledby="device-heading" className="scroll-mt-20 space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 id="device-heading" className="text-xl font-semibold tracking-tight">On this device</h2>
                    <p className="text-sm text-muted-foreground">
                      {user ? "Not in your account yet." : "Saved in this browser only."}
                    </p>
                  </div>
                  {user && deviceDrafts.length > 0 && (
                    <Button variant="outline" className="h-11" onClick={syncNow} disabled={syncing}>
                      {syncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} aria-hidden />
                      ) : (
                        <RefreshCw className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      )}
                      Save to account
                    </Button>
                  )}
                </div>

                {continuing ? (
                  <div className="rounded-lg border p-4 sm:p-6">
                    <PostRoastCard
                      key={continuing.result.id}
                      result={continuing.result}
                      onDiscard={() => setContinueId(null)}
                      onNextBatch={(ref) => navigate(roastAgainHref(continuing.result.roasterType, ref.id))}
                    />
                  </div>
                ) : null}

                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {deviceDrafts
                    .filter((d) => d.result.id !== continueId)
                    .map((d) => (
                      <RoastCard key={d.result.id} card={draftToCard(d)} href={null} headingLevel="h3">
                        <div className="relative z-10 flex gap-2">
                          <Button variant="outline" className="h-11 flex-1" onClick={() => startContinue(d)}>
                            Continue
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-11 text-destructive hover:bg-muted hover:text-destructive"
                            onClick={() => setDeleteTarget({ kind: "draft", id: d.result.id, title: draftTitle(d) })}
                          >
                            Discard
                          </Button>
                        </div>
                      </RoastCard>
                    ))}
                </ul>
              </section>
            )}

            {error && (
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
                <p className="text-sm">Your saved roasts could not be loaded.</p>
                <Button variant="outline" className="h-11" onClick={() => void refresh()}>
                  Try again
                </Button>
              </div>
            )}

            {!hasAnything && !error ? (
              <div className="flex flex-col items-start gap-4 rounded-lg border p-6 sm:p-10">
                <Coffee className="h-8 w-8 text-muted-foreground" strokeWidth={1.75} aria-hidden />
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold tracking-tight">No roasts yet</h2>
                  <p className="text-sm text-muted-foreground">
                    Time a batch and it lands here, even before you sign in.
                  </p>
                </div>
                <Button asChild size="lg" className="h-12">
                  <Link to="/roast">Start roasting</Link>
                </Button>
              </div>
            ) : (
              <>
                <TrendStrip points={trend} />
                {user && <ReadyToTaste items={tasting} />}

                {rows.length > 0 && (
                  <section aria-labelledby="saved-heading" className="space-y-6">
                    <div className="flex flex-col gap-4">
                      <h2 id="saved-heading" className="text-xl font-semibold tracking-tight">
                        Saved roasts <span className="font-mono text-base font-normal tabular-nums text-muted-foreground">{filteredRows.length}</span>
                      </h2>
                      <RoasterFilter value={roaster} onChange={setRoaster} counts={counts} />
                    </div>

                    {groups.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No roasts on this roaster.{" "}
                        <button type="button" className="underline underline-offset-4" onClick={() => setRoaster(ALL_ROASTERS)}>
                          Show all
                        </button>
                      </p>
                    ) : (
                      groups.map((group) => (
                        <section key={group.key} aria-label={group.title} className="space-y-3">
                          <h3 className="flex items-baseline gap-2 text-base font-semibold">
                            <span className="min-w-0 truncate">{group.title}</span>
                            <span className="font-mono text-sm font-normal tabular-nums text-muted-foreground">
                              {group.rows.length === 1 ? "1 roast" : `${group.rows.length} roasts`}
                            </span>
                          </h3>
                          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {group.rows.map((row) => {
                              const card = rowToCard(row);
                              const visibility = rowVisibility(row);
                              return (
                                <RoastCard
                                  key={row.id}
                                  card={card}
                                  headingLevel="h3"
                                  actions={
                                    <>
                                      <VisibilityBadge visibility={visibility} />
                                      <RoastActions
                                        title={card.title}
                                        roastAgainHref={roastAgainHref(row.roaster_type, row.id)}
                                        onDelete={() => setDeleteTarget({ kind: "row", id: row.id, title: card.title })}
                                        visibility={visibility}
                                        onVisibilityChange={(v) => void changeVisibility(row.id, v)}
                                      />
                                    </>
                                  }
                                />
                              );
                            })}
                          </ul>
                        </section>
                      ))
                    )}
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTarget?.kind === "draft" ? "Discard this roast?" : "Delete this roast?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.kind === "draft"
                ? `"${deleteTarget.title}" is removed from this device. This cannot be undone.`
                : `"${deleteTarget?.title ?? ""}" is removed from your account and from Discover. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteTarget?.kind === "draft" ? "Discard" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
