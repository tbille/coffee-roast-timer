import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ORDER = ["system", "light", "dark"] as const;
type ThemeChoice = (typeof ORDER)[number];

const META: Record<ThemeChoice, { label: string; Icon: typeof Sun }> = {
  system: { label: "System theme", Icon: Laptop },
  light: { label: "Light theme", Icon: Sun },
  dark: { label: "Dark theme", Icon: Moon },
};

/** Cycles System -> Light -> Dark. The accessible name states the current theme and the next one. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current: ThemeChoice = mounted && ORDER.includes(theme as ThemeChoice) ? (theme as ThemeChoice) : "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  const { Icon, label } = META[current];

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-10 w-10", className)}
      onClick={() => setTheme(next)}
      aria-label={`${label}. Switch to ${META[next].label.toLowerCase()}`}
      title={label}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
    </Button>
  );
}
