import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StartingConditions } from "@/types/roast.types";
import type { BatchCheck } from "@/utils/roastProfileView";

interface RoastSetupProps {
  origin?: string | null;
  farm?: string | null;
  process?: string | null;
  roaster?: string;
  manufacturer?: string;
  weightIn?: number;
  weightOut?: number;
  batchCheck?: BatchCheck;
  startingConditions?: StartingConditions;
  environmentalNotes?: string | null;
  instructions?: string | null;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 wrap-break-word">{children}</dd>
    </div>
  );
}

export function RoastSetup(props: RoastSetupProps) {
  const sc = props.startingConditions;
  const conditions = [
    sc?.room_temp_c != null && `Room ${sc.room_temp_c}°C`,
    sc?.bean_temp_c != null && `Beans ${sc.bean_temp_c}°C`,
    sc?.humidity_percent != null && `${sc.humidity_percent}% humidity`,
    sc?.altitude_m != null && `${sc.altitude_m} m altitude`,
  ].filter(Boolean) as string[];

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle as="h2" className="text-lg">Beans &amp; setup</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y">
          {props.origin && <Row label="Origin">{props.origin}</Row>}
          {props.farm && <Row label="Farm">{props.farm}</Row>}
          {props.process && <Row label="Process">{props.process}</Row>}
          {props.roaster && (
            <Row label="Roaster">
              {props.roaster}
              {props.manufacturer && !props.roaster.startsWith(props.manufacturer) && (
                <span className="text-muted-foreground"> · {props.manufacturer}</span>
              )}
            </Row>
          )}
          {props.weightIn && (
            <Row label="Batch">
              <span className="tabular-nums">{props.weightIn} g green</span>
              {props.weightOut && <span className="tabular-nums text-muted-foreground"> → {props.weightOut} g roasted</span>}
              {props.batchCheck && props.batchCheck.status !== "within" && (
                <p className="mt-1 flex items-start gap-1.5 text-xs text-[hsl(var(--warning))]">
                  <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                  {props.batchCheck.status === "below" ? "Below" : "Above"} the {props.batchCheck.min}–{props.batchCheck.max} g range
                  recommended for this roaster, so timings may not transfer to a normal batch.
                </p>
              )}
            </Row>
          )}
          {conditions.length > 0 && <Row label="Conditions">{conditions.join(" · ")}</Row>}
          {props.environmentalNotes && (
            <Row label="Environment">
              <span className="whitespace-pre-wrap">{props.environmentalNotes}</span>
            </Row>
          )}
          {props.instructions && (
            <Row label="Instructions">
              <span className="whitespace-pre-wrap">{props.instructions}</span>
            </Row>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
