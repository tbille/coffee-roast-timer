import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatClock, parseClock } from "@/lib/format";
import { cn } from "@/lib/utils";
import { findEvent } from "@/lib/saveRoast";
import type { RoastEvent, RoastEventType } from "@/types/roast-session.types";
import { eventInputId } from "./draftView";

const EVENT_LABELS: Record<RoastEventType, string> = {
  turning_point: "Turning point",
  yellowing: "Yellowing",
  first_crack: "First crack",
  second_crack: "Second crack",
  drop: "Drop",
};

const ORDER: RoastEventType[] = ["turning_point", "yellowing", "first_crack", "second_crack", "drop"];
const REMOVABLE: RoastEventType[] = ["turning_point", "yellowing", "second_crack"];


/** Checks that the event order still holds with `type` at `s` seconds. Returns an error message or null. */
function orderError(events: RoastEvent[], type: RoastEventType, s: number): string | null {
  if (s <= 0) return "Use a time after charge, e.g. 7:42.";
  const idx = ORDER.indexOf(type);
  for (let i = idx - 1; i >= 0; i--) {
    const before = findEvent(events, ORDER[i]);
    if (before && Math.round(before.t / 1000) >= s) {
      return `Must be after ${EVENT_LABELS[ORDER[i]].toLowerCase()} (${formatClock(before.t / 1000)}).`;
    }
  }
  for (let i = idx + 1; i < ORDER.length; i++) {
    const after = findEvent(events, ORDER[i]);
    if (after && Math.round(after.t / 1000) <= s) {
      return `Must be before ${EVENT_LABELS[ORDER[i]].toLowerCase()} (${formatClock(after.t / 1000)}).`;
    }
  }
  return null;
}

interface EventTimesProps {
  baseId: string;
  events: RoastEvent[];
  onChange: (events: RoastEvent[]) => void;
}

/** Every marked moment with an editable m:ss time. Corrections keep the original time (`editedFromT`). */
export function EventTimes({ baseId, events, onChange }: EventTimesProps) {
  const [addingYellowing, setAddingYellowing] = useState(false);
  const present = ORDER.filter((type) => findEvent(events, type));
  const canAddYellowing = !findEvent(events, "yellowing") && !!findEvent(events, "first_crack");

  const commit = (type: RoastEventType, s: number) => {
    const existing = findEvent(events, type);
    if (existing && Math.round(existing.t / 1000) === s) return;
    const t = s * 1000;
    const next = existing
      ? events.map((e) => (e === existing ? { ...e, t, tempC: undefined, editedFromT: e.editedFromT ?? e.t } : e))
      : [...events, { type, t }];
    onChange(next.sort((a, b) => a.t - b.t));
  };

  const remove = (type: RoastEventType) => onChange(events.filter((e) => e.type !== type));

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Events</legend>
      <p className="text-sm text-muted-foreground">Times are from charge. Fix any you tapped late.</p>
      <ul className="divide-y rounded-lg border">
        {present.map((type) => {
          const e = findEvent(events, type)!;
          return (
            <li key={type} className="flex items-center gap-3 px-3 py-2 sm:px-4">
              <TimeField
                id={eventInputId(baseId, type)}
                label={EVENT_LABELS[type]}
                seconds={Math.round(e.t / 1000)}
                editedFrom={e.editedFromT !== undefined ? Math.round(e.editedFromT / 1000) : undefined}
                validate={(s) => orderError(events, type, s)}
                onCommit={(s) => commit(type, s)}
              />
              {REMOVABLE.includes(type) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => remove(type)}
                  aria-label={`Remove ${EVENT_LABELS[type].toLowerCase()}`}
                >
                  <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </Button>
              ) : (
                <span className="h-11 w-11 shrink-0" aria-hidden />
              )}
            </li>
          );
        })}
        {canAddYellowing && addingYellowing && (
          <li className="flex items-center gap-3 px-3 py-2 sm:px-4">
            <TimeField
              id={eventInputId(baseId, "yellowing")}
              label="Yellowing"
              autoFocus
              validate={(s) => orderError(events, "yellowing", s)}
              onCommit={(s) => {
                commit("yellowing", s);
                setAddingYellowing(false);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setAddingYellowing(false)}
              aria-label="Cancel adding yellowing"
            >
              <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </Button>
          </li>
        )}
      </ul>
      {canAddYellowing && !addingYellowing && (
        <Button type="button" variant="outline" className="h-11" onClick={() => setAddingYellowing(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Add yellowing
        </Button>
      )}
    </fieldset>
  );
}

interface TimeFieldProps {
  id: string;
  label: string;
  seconds?: number;
  editedFrom?: number;
  autoFocus?: boolean;
  validate: (s: number) => string | null;
  onCommit: (s: number) => void;
}

function TimeField({ id, label, seconds, editedFrom, autoFocus, validate, onCommit }: TimeFieldProps) {
  const initial = seconds !== undefined ? formatClock(seconds) : "";
  const [text, setText] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [lastSeconds, setLastSeconds] = useState(seconds);

  // Keep the field in step when the time changes from elsewhere (e.g. "Fix the time").
  if (seconds !== lastSeconds) {
    setLastSeconds(seconds);
    setText(seconds !== undefined ? formatClock(seconds) : "");
    setError(null);
  }

  const submit = () => {
    if (text.trim() === "" && seconds === undefined) return;
    // Phone number pads have no colon: accept "7.42" / "7,42" as 7:42.
    const s = parseClock(text.trim().replace(/^(\d{1,3})[.,](\d{2})$/, "$1:$2"));
    if (s === undefined) {
      setError("Use m:ss, e.g. 7:42.");
      return;
    }
    const problem = validate(s);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setText(formatClock(s));
    onCommit(s);
  };

  const errorId = `${id}-error`;
  const noteId = `${id}-note`;
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
      <label htmlFor={id} className="min-w-28 flex-1 text-sm">
        {label}
      </label>
      <Input
        id={id}
        value={text}
        autoFocus={autoFocus}
        inputMode="decimal"
        autoComplete="off"
        placeholder="m:ss"
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error && errorId, editedFrom !== undefined && noteId) || undefined}
        onChange={(e) => setText(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        className={cn(
          "h-11 w-24 text-right font-mono tabular-nums",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
      {editedFrom !== undefined && (
        <span id={noteId} className="basis-full text-right text-xs text-muted-foreground">
          Edited · was <span className="font-mono tabular-nums">{formatClock(editedFrom)}</span>
        </span>
      )}
      {error && (
        <span id={errorId} className="basis-full text-right text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
