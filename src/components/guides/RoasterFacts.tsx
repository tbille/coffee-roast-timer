import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getRoasterSpec } from "@/utils/roasterRegistry";
import type { RoasterType } from "@/types/roaster.types";
import { AtAGlance } from "./prose";

const minutes = (seconds: number) => Math.round(seconds / 60);

/**
 * "At a glance" facts for a roaster guide, read from the roaster registry so
 * the docs and the app never disagree about batch sizes or roast length.
 */
export function RoasterFacts({ roaster, extra = [] }: { roaster: RoasterType; extra?: { label: string; value: ReactNode }[] }) {
  const spec = getRoasterSpec(roaster);
  return (
    <AtAGlance
      items={[
        { label: "Batch size", value: `${spec.minBatchSize}–${spec.maxBatchSize} g` },
        { label: "Good starting batch", value: `${spec.recommendedBatchSize} g` },
        {
          label: "Typical roast",
          value: `${minutes(spec.typicalDuration.min)}–${minutes(spec.typicalDuration.max)} min`,
        },
        ...extra,
      ]}
    />
  );
}

/** Closing links shared by every roaster guide: start a roast, see others' roasts. */
export function RoasterLinks({ roaster }: { roaster: RoasterType }) {
  const spec = getRoasterSpec(roaster);
  const linkClass =
    "group inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/50";
  return (
    <div className="not-prose mt-8 flex flex-wrap gap-3">
      <Link to={`/roast?roaster=${roaster}`} className={linkClass}>
        Start a {spec.displayName} roast
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" aria-hidden />
      </Link>
      <Link to={`/discover?roaster=${roaster}`} className={linkClass}>
        See {spec.displayName} roasts on Discover
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" aria-hidden />
      </Link>
    </div>
  );
}
