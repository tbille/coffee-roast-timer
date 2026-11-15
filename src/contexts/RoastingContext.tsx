import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Whether a roast is running in focus mode. When true, the header, footer and
 * mobile tab bar render nothing so the console can take the full viewport.
 * Also mirrored as `data-roasting` on <body> for CSS hooks.
 */
export interface RoastingContextValue {
  roasting: boolean;
  setRoasting: (roasting: boolean) => void;
}

const RoastingContext = createContext<RoastingContextValue | undefined>(undefined);

export function RoastingProvider({ children }: { children: ReactNode }) {
  const [roasting, setRoasting] = useState(false);

  useEffect(() => {
    if (roasting) document.body.dataset.roasting = "true";
    else delete document.body.dataset.roasting;
  }, [roasting]);

  const value = useMemo(() => ({ roasting, setRoasting }), [roasting]);
  return <RoastingContext.Provider value={value}>{children}</RoastingContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRoasting(): RoastingContextValue {
  const ctx = useContext(RoastingContext);
  if (!ctx) throw new Error("useRoasting must be used inside <RoastingProvider>");
  return ctx;
}
