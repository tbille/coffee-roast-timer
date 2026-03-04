import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function DocsScrollTop() {
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith("/how-to") || location.hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  return null;
}
