import { Fan, Flame, Gauge, Popcorn, Thermometer, Timer, type LucideIcon } from "lucide-react";
import { IMPLEMENTED_ROASTERS, ROASTER_SPECS } from "@/utils/roasterRegistry";
import { DOCS } from "@/content/docs";
import type { RoasterType } from "@/types/roaster.types";

/** Machines the roast console has a mode for, in landing order (from the registry). */
export const LANDING_ROASTERS: RoasterType[] = IMPLEMENTED_ROASTERS;

/** How the console adapts to each machine: one short, factual line, plus an icon for the main control. */
const ADAPTS: Record<string, { icon: LucideIcon; text: string }> = {
  "gene-cbr-101": { icon: Thermometer, text: "Log the setpoint to the degree as you turn the dial, plus optional bean readings." },
  "behmor-2000ab": { icon: Timer, text: "Weight button, program P1–P5 and +15 s presses, next to the LCD countdown." },
  "freshroast-sr800": { icon: Fan, text: "Heat and fan on the same 1–9 scale as the dials. One tap per change." },
  "kaldi-wide": { icon: Flame, text: "Flame changes on your own burner scale, and readings typed or spoken." },
  "hottop-kn8828": { icon: Gauge, text: "Heat and fan in percent, bean and environment temperature, turning point." },
  "popcorn-popper": { icon: Popcorn, text: "Just the clock and the cracks, with batch limits and safety cues." },
};

export interface LandingMachine {
  id: RoasterType;
  name: string;
  icon: LucideIcon;
  text: string;
  batch: string;
  guidePath?: string;
}

export const LANDING_MACHINES: LandingMachine[] = LANDING_ROASTERS.filter((id) => ROASTER_SPECS[id]).map((id) => {
  const spec = ROASTER_SPECS[id];
  const guide = DOCS.find((d) => d.roasterId === id);
  return {
    id,
    name: spec.displayName,
    icon: ADAPTS[id]?.icon ?? Timer,
    text: ADAPTS[id]?.text ?? "",
    batch: `${spec.minBatchSize}–${spec.maxBatchSize} g`,
    guidePath: guide?.path,
  };
});
