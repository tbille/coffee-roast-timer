import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Docs navigation scroll behaviour: a new guide opens at the top; a link with
 * a hash (e.g. the breadcrumb to /how-to#tasks) scrolls to that section once
 * the lazily loaded page has rendered it.
 */
export function DocsScrollTop() {
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith("/how-to")) return;

    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const id = decodeURIComponent(location.hash.slice(1));
    let frame = 0;
    let attempts = 0;
    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ block: "start" });
      } else if (attempts++ < 60) {
        frame = requestAnimationFrame(tryScroll);
      }
    };
    tryScroll();
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  return null;
}
