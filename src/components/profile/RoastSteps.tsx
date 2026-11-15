import type { ReactNode } from "react";
import { ArrowDownToLine, Play, Plus, SlidersHorizontal, StickyNote, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatClock, type RoastStep, type StepKind } from "@/utils/roastProfileView";

const KIND_STYLE: Record<StepKind, { icon: typeof Play; className: string }> = {
  start: { icon: Play, className: "bg-primary text-primary-foreground" },
  setting: { icon: SlidersHorizontal, className: "bg-secondary text-secondary-foreground" },
  extension: { icon: Plus, className: "bg-secondary text-secondary-foreground" },
  milestone: { icon: StickyNote, className: "bg-muted text-foreground" },
  first_crack: { icon: Zap, className: "bg-[hsl(var(--phase-development))] text-white" },
  second_crack: { icon: Zap, className: "bg-foreground text-background" },
  drop: { icon: ArrowDownToLine, className: "bg-primary text-primary-foreground" },
};

/** General, roaster-independent cues. Always labelled as such in the UI. */
const GENERAL_GUIDANCE: Partial<Record<StepKind, string>> = {
  first_crack: "Listen for loud, popcorn-like pops; beans swell and turn light brown.",
  second_crack: "A quieter, faster crackle; oils begin to show on the surface.",
  drop: "Cool the beans quickly to stop the roast.",
};

export function RoastSteps({ steps, footer }: { steps: RoastStep[]; footer?: ReactNode }) {
  return (
    <Card className="shadow-coffee">
      <CardHeader className="pb-3">
        <CardTitle as="h2" className="text-lg">Roast steps</CardTitle>
        <p className="text-sm text-muted-foreground">What happened during this roast, in order.</p>
      </CardHeader>
      <CardContent>
        <ol className="relative">
          {steps.map((step, index) => {
            const { icon: Icon, className } = KIND_STYLE[step.kind];
            const isLast = index === steps.length - 1;
            const guidance = GENERAL_GUIDANCE[step.kind];
            return (
              <li key={`${step.kind}-${step.time}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
                {!isLast && <span className="absolute left-[calc(4.625rem-0.5px)] top-8 bottom-0 w-px bg-border" aria-hidden />}
                <time
                  className="w-12 shrink-0 pt-1 text-right font-mono text-sm font-semibold tabular-nums"
                  dateTime={`PT${Math.round(step.time)}S`}
                >
                  {formatClock(step.time)}
                </time>
                <span className={cn("z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", className)} aria-hidden>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium">{step.title}</span>
                    {step.values?.map((value) => (
                      <span key={value} className="rounded-md border bg-background px-2 py-0.5 text-xs font-medium">
                        {value}
                      </span>
                    ))}
                  </div>
                  {step.detail && <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>}
                  {guidance && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium">General cue:</span> {guidance}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {footer && <div className="mt-6 border-t pt-4">{footer}</div>}
      </CardContent>
    </Card>
  );
}
