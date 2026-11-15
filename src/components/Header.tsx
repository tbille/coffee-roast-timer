import { Link } from "react-router";
import { Coffee } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useIsActive } from "@/components/layout/useIsActive";
import { useRoasting } from "@/contexts/RoastingContext";
import { cn } from "@/lib/utils";

const Header = () => {
  const { roasting } = useRoasting();
  const isActive = useIsActive();
  if (roasting) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm supports-backdrop-filter:bg-background/80">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Coffee className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden />
          Roast Timer
        </Link>

        <nav aria-label="Main" className="hidden h-full items-stretch gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:content-['']",
                  active ? "text-foreground after:bg-foreground" : "text-muted-foreground hover:text-foreground after:bg-transparent",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
