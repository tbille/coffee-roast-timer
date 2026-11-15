import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ListChecks, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UserSettingsDialog from "@/components/UserSettingsDialog";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ITEM =
  "flex h-10 w-full items-center gap-2 rounded-md px-2 text-sm text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring";

/** Initial avatar with My roasts / Settings / Sign out, or a "Sign in" link when signed out. */
export function AccountMenu({ className }: { className?: string }) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (loading) return <span className={cn("inline-block h-10 w-10", className)} aria-hidden />;

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link to="/auth">Sign in</Link>
      </Button>
    );
  }

  const initial = (user.email?.trim()[0] ?? "?").toUpperCase();

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              className,
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground" aria-hidden>
              {initial}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-1">
          {user.email && <p className="truncate px-2 py-1.5 text-xs text-muted-foreground">{user.email}</p>}
          <nav aria-label="Account" className="flex flex-col">
            <Link to="/roasts" className={ITEM} onClick={() => setOpen(false)}>
              <ListChecks className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              My roasts
            </Link>
            <button
              type="button"
              className={ITEM}
              onClick={() => {
                setOpen(false);
                setSettingsOpen(true);
              }}
            >
              <Settings className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Settings
            </button>
            <button
              type="button"
              className={ITEM}
              onClick={async () => {
                setOpen(false);
                await signOut();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Sign out
            </button>
          </nav>
        </PopoverContent>
      </Popover>
      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
