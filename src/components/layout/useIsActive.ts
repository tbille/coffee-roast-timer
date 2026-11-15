import { useLocation } from "react-router";
import type { NavItem } from "./nav-items";

/** True when the current path is the item's route, below it, or one of its extra prefixes. */
export function useIsActive() {
  const { pathname } = useLocation();
  return (item: NavItem) =>
    pathname === item.to ||
    pathname.startsWith(`${item.to}/`) ||
    (item.match ?? []).some((prefix) => pathname.startsWith(prefix));
}
