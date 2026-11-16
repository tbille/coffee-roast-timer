import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { ROAST_SESSION_KEY, readRunningElapsedMs } from "@/hooks/useRoastSession";
import { formatClockMs } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * "Roast in progress · 3:12" link back to /roast, shown on other pages while a
 * roast runs. Reads the persisted session (the console is unmounted off /roast)
 * and ticks once a second only while it is shown.
 */
export function RoastInProgress({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const onRoast = /^\/roast\/?$/.test(pathname);
  const [now, setNow] = useState(() => Date.now());
  const elapsedMs = onRoast ? null : readRunningElapsedMs(ROAST_SESSION_KEY, now);
  const visible = elapsedMs !== null;

  // Re-read on route changes and when another tab starts or ends a roast.
  useEffect(() => {
    setNow(Date.now());
  }, [pathname]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === ROAST_SESSION_KEY) setNow(Date.now());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [visible]);

  if (!visible) return null;
  const clock = formatClockMs(elapsedMs);

  return (
    <Link
      to="/roast"
      aria-label={`Roast in progress, ${clock}. Back to the roast`}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-accent bg-background px-3 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-accent motion-safe:animate-pulse" aria-hidden />
      <span>Roast in progress</span>
      <span aria-hidden>·</span>
      <span className="font-mono tabular-nums">{clock}</span>
    </Link>
  );
}
