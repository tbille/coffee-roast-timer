import { Link } from "react-router";
import { useRoasting } from "@/contexts/RoastingContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { RoastInProgress } from "./RoastInProgress";
import { useIsActive } from "./useIsActive";

/**
 * Fixed bottom navigation on phones (hidden from md up, and while roasting), with
 * the roast-in-progress pill floating just above it.
 */
export function BottomTabBar() {
  const { roasting } = useRoasting();
  const isActive = useIsActive();
  const isMobile = useIsMobile();
  if (roasting) return null;

  return (
    <>
      {isMobile && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.5rem)] z-40 flex justify-center px-4 md:hidden">
          <RoastInProgress className="pointer-events-auto h-10 shadow-sm" />
        </div>
      )}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm supports-backdrop-filter:bg-background/90 md:hidden"
      >
        <ul className="grid h-14 grid-cols-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex">
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    "before:absolute before:inset-x-6 before:top-0 before:h-0.5 before:rounded-full before:content-['']",
                    active ? "text-foreground before:bg-foreground" : "text-muted-foreground before:bg-transparent",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
