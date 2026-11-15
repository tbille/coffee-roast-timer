import { BookOpen, Compass, ListChecks, Timer, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Extra path prefixes that mark this item as current */
  match?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Roast", to: "/roast", icon: Timer },
  { label: "My roasts", to: "/roasts", icon: ListChecks, match: ["/compare"] },
  { label: "Discover", to: "/discover", icon: Compass, match: ["/profile/"] },
  { label: "Learn", to: "/how-to", icon: BookOpen },
];
