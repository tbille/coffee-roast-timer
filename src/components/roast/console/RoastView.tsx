/**
 * Roast (status running): full-viewport focus view with one clock, one phase
 * ribbon and one next-event button. "Exit focus" shows the normal page around it.
 */
import { forwardRef, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { Maximize2, Minimize2, Undo2, X } from 'lucide-react';
import { PhaseBar } from '@/components/roast-card/PhaseBar';
import { cn } from '@/lib/utils';
import { formatClock, formatClockDelta, formatClockMs, formatPercent, msToSeconds, type TempUnit } from '@/lib/format';
import { ROASTER_SPECS } from '@/utils/roasterRegistry';
import type { RoastEventType, RoastReference } from '@/types/roast-session.types';
import type { VoiceCommand } from './voice';
import { EventLog } from './EventLog';
import { MachineControls } from './MachineControls';
import { PressButton } from './PressButton';
import { ShortcutHelp } from './ShortcutHelp';
import { TempForm } from './TempForm';
import {
  EVENT_LABELS,
  PHASE_LABELS,
  findEvent,
  liveMarkers,
  livePhases,
  logLines,
  nextPrimaryEvent,
  referenceGhosts,
  undoLineKey,
  type ConsoleLog,
  type StartingSettings,
} from './model';

export interface Snackbar {
  text: string;
  onUndo: () => void;
}

export interface RoastViewProps {
  log: ConsoleLog;
  elapsedMs: number;
  unit: TempUnit;
  focus: boolean;
  onFocusChange: (focus: boolean) => void;
  wake: { supported: boolean; locked: boolean };
  restoredMs: number | null;
  onDismissRestored: () => void;
  reference: RoastReference | null;
  values: StartingSettings;
  /** Elapsed ms right now: call it in the input handler to stamp an event */
  stamp: () => number;
  onEvent: (type: RoastEventType, t: number) => void;
  onSkipYellowing: (t: number) => void;
  onUndo: () => void;
  onReading: (beanC: number, envC?: number, voice?: boolean) => void;
  onControl: (control: string, value: number) => void;
  onPress: (control: string, value: number | string) => void;
  onColourCue: (color: string) => void;
  shortcuts: boolean;
  onShortcutsChange: (on: boolean) => void;
  audio: boolean;
  onAudioChange: (on: boolean) => void;
  snackbar: Snackbar | null;
  onDismissSnackbar: () => void;
  announcement: string;
  /** Popcorn popper 3:00 reminder band */
  notice: string | null;
  primaryRef: RefObject<HTMLButtonElement | null>;
}

const chip =
  'inline-flex h-12 shrink-0 items-center justify-center rounded-full border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

/** After the big button logs an event, it ignores presses this long (a double tap must not FC → Drop). */
const PRIMARY_COOLDOWN_MS = 1000;

const KEY_HINT: Record<RoastEventType, string> = {
  turning_point: '',
  yellowing: 'Space or Y',
  first_crack: 'Space or F',
  second_crack: 'S',
  drop: 'Space or D',
};

export function RoastView(props: RoastViewProps) {
  const {
    log,
    elapsedMs,
    unit,
    focus,
    onFocusChange,
    wake,
    restoredMs,
    onDismissRestored,
    reference,
    values,
    stamp,
    onEvent,
    onSkipYellowing,
    onUndo,
    onReading,
    onControl,
    onPress,
    onColourCue,
    shortcuts,
    onShortcutsChange,
    audio,
    onAudioChange,
    snackbar,
    onDismissSnackbar,
    announcement,
    notice,
    primaryRef,
  } = props;
  const roasterType = log.roasterType ?? 'custom';
  const spec = ROASTER_SPECS[roasterType];
  const tempRef = useRef<HTMLInputElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const elapsedS = elapsedMs / 1000;
  const yellow = findEvent(log, 'yellowing');
  const fc = findEvent(log, 'first_crack');
  const sc = findEvent(log, 'second_crack');
  const tp = findEvent(log, 'turning_point');
  const next = nextPrimaryEvent(log);
  const phases = livePhases(log, elapsedS);
  const current = phases[phases.length - 1];

  // Status line: phase + its duration; after FC, development time and share (neutral, no verdict).
  const status = fc
    ? `Development ${formatClock(elapsedS - fc.t / 1000)} · ${formatPercent(((elapsedS - fc.t / 1000) / Math.max(1, elapsedS)) * 100, 0)}`
    : `${PHASE_LABELS[current.key]} · ${formatClock(elapsedS - current.start)}`;

  const delta = referenceDelta(log, reference, elapsedS);
  const expectedDrop = reference?.dropS ?? behmorEnd(log) ?? spec.typicalDuration.max;
  const ghosts = referenceGhosts(reference);
  const nextCue = reference?.cues.find((c) => c.s > elapsedS - 5);

  const canDrop = !!yellow || log.yellowingSkipped || !!fc;
  const fire = (type: RoastEventType) => onEvent(type, stamp());

  // Double-tap guard for the next-event button and Space/Enter (secondary chips and Undo are not affected).
  const cooldownUntil = useRef(0);
  const cooldownTimer = useRef<number | undefined>(undefined);
  const [coolingDown, setCoolingDown] = useState(false);
  useEffect(() => () => window.clearTimeout(cooldownTimer.current), []);
  const firePrimary = (t: number) => {
    const now = performance.now();
    if (now < cooldownUntil.current || (next === 'drop' && !canDrop)) return;
    cooldownUntil.current = now + PRIMARY_COOLDOWN_MS;
    setCoolingDown(true);
    window.clearTimeout(cooldownTimer.current);
    cooldownTimer.current = window.setTimeout(() => setCoolingDown(false), PRIMARY_COOLDOWN_MS);
    onEvent(next, t);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    // Portaled content (the help popover) bubbles through React but is not the console.
    if (!e.currentTarget.contains(target)) return;
    const typing = !!target.closest('input, textarea, select, [contenteditable="true"]');
    if (e.key === 'Escape') {
      if (helpOpen) return;
      if (typing) {
        target.blur();
        return;
      }
      if (focus) {
        e.preventDefault();
        onFocusChange(false);
      }
      return;
    }
    if (typing || !shortcuts || e.repeat) return;
    const t = stamp();
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    switch (key) {
      case ' ':
      case 'Enter':
        // Let buttons, chips and steppers handle their own activation.
        if (target.closest('button, a, [role="spinbutton"], [role="radio"], [role="switch"]')) return;
        e.preventDefault();
        firePrimary(t);
        return;
      case 'y':
        if (!fc) onEvent('yellowing', t);
        break;
      case 'f':
        onEvent('first_crack', t);
        break;
      case 's':
        if (fc) onEvent('second_crack', t);
        break;
      case 'd':
        if (canDrop) onEvent('drop', t);
        break;
      case 't':
        tempRef.current?.focus();
        break;
      case 'u':
        onUndo();
        break;
      case '?':
        setHelpOpen(true);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const lines = logLines(log, unit);

  return (
    <section
      aria-labelledby="roast-console-title"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={cn(
        'flex flex-col bg-background text-foreground outline-hidden',
        focus
          ? 'fixed inset-0 z-40 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)]'
          : 'mx-auto my-4 min-h-[calc(100dvh-8rem)] w-full max-w-6xl rounded-lg border border-border sm:my-6',
      )}
    >
      <h1 id="roast-console-title" className="sr-only">
        Roast in progress
      </h1>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Top strip */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-1.5 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {spec.name}
            {reference && <span className="text-muted-foreground"> · following {reference.name}</span>}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {wake.locked ? 'Screen stays on' : wake.supported ? 'Screen may sleep: tap the screen now and then' : 'Keep your screen on'}
          </p>
        </div>
        <ShortcutHelp
          open={helpOpen}
          onOpenChange={setHelpOpen}
          shortcuts={shortcuts}
          onShortcutsChange={onShortcutsChange}
          audio={audio}
          onAudioChange={onAudioChange}
        />
        <button
          type="button"
          onClick={() => onFocusChange(!focus)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          {focus ? (
            <Minimize2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          ) : (
            <Maximize2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          )}
          {focus ? 'Exit focus' : 'Focus view'}
        </button>
      </div>

      {restoredMs !== null && (
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-muted px-3 py-1.5 text-sm sm:px-6" role="status">
          <span className="flex-1">
            Roast restored — <span className="font-mono tabular-nums">{formatClockMs(restoredMs)}</span>
          </span>
          <button
            type="button"
            onClick={onDismissRestored}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      )}

      {/* Body: one column on phones, clock left / controls right on desktop */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-x-10 gap-y-5 px-4 py-3 sm:px-6 lg:grid-cols-[3fr_2fr] lg:py-6">
          <div className="min-w-0 space-y-3">
            <p
              className="text-center font-mono font-semibold leading-none tracking-tight tabular-nums text-foreground lg:text-left [font-size:clamp(4rem,min(26vw,38vh),14rem)] lg:[font-size:clamp(4rem,min(17vw,38vh),14rem)]"
              role="timer"
              aria-label={`Elapsed ${formatClockMs(elapsedMs)}`}
            >
              {formatClockMs(elapsedMs)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 lg:justify-start">
              <p className="font-mono text-lg tabular-nums text-foreground sm:text-xl">{status}</p>
              {delta && (
                <span className="rounded-full border border-border px-3 py-0.5 font-mono text-sm tabular-nums text-foreground">
                  {delta}
                </span>
              )}
            </div>
            {notice && (
              <p className="rounded-md border border-warning bg-background px-3 py-2 text-center text-sm font-medium text-foreground lg:text-left">
                {notice}
              </p>
            )}
            <PhaseBar
              phases={phases}
              size="lg"
              currentS={elapsedS}
              totalS={Math.max(expectedDrop, elapsedS)}
              markers={liveMarkers(log)}
              ghostMarkers={ghosts}
              ariaLabel=""
            />
            {nextCue && (
              <p className="text-sm text-muted-foreground">
                Reference: <span className="text-foreground">{nextCue.label}</span> at{' '}
                <span className="font-mono tabular-nums">{formatClock(nextCue.s)}</span>
              </p>
            )}
          </div>

          <div className="min-w-0 space-y-4">
            <MachineControls
              roasterType={roasterType}
              log={log}
              values={values}
              unit={unit}
              elapsedS={elapsedS}
              onControl={onControl}
              onPress={onPress}
              onColourCue={onColourCue}
            />
            <TempForm
              ref={tempRef}
              label={spec.tempLabel ?? 'Bean temp'}
              unit={unit}
              withEnv={roasterType === 'hottop-kn8828'}
              onLog={(beanC, envC) => onReading(beanC, envC)}
              voice={
                roasterType === 'kaldi-wide'
                  ? {
                      onReading: (c) => onReading(c, undefined, true),
                      onCommand: (command: VoiceCommand) => fire(command),
                    }
                  : undefined
              }
            />
            <EventLog lines={lines} undoKey={undoLineKey(log)} onUndo={onUndo} />
          </div>
        </div>
      </div>

      {/* Dock */}
      <div className="shrink-0 space-y-2 border-t border-border px-3 pb-3 pt-2 sm:px-6">
        {snackbar && <SnackbarBar snackbar={snackbar} onDismiss={onDismissSnackbar} />}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <PrimaryButton
            ref={primaryRef}
            label={EVENT_LABELS[next]}
            hint={shortcuts ? KEY_HINT[next] : undefined}
            disabled={next === 'drop' && !canDrop}
            coolingDown={coolingDown}
            onPress={() => firePrimary(stamp())}
          />
          <div className="flex gap-2 overflow-x-auto lg:shrink-0">
            {spec.probe && !tp && !yellow && !fc && (
              <PressButton className={chip} onPress={() => fire('turning_point')}>
                Turning point
              </PressButton>
            )}
            {!yellow && !log.yellowingSkipped && !fc && (
              <PressButton className={chip} onPress={() => onSkipYellowing(stamp())}>
                Skip yellowing
              </PressButton>
            )}
            {fc && !sc && (
              <PressButton className={chip} onPress={() => fire('second_crack')}>
                Second crack
              </PressButton>
            )}
            {next !== 'drop' && canDrop && (
              <PressButton className={chip} onPress={() => fire('drop')}>
                Drop
              </PressButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const PrimaryButton = forwardRef<
  HTMLButtonElement,
  { label: string; hint?: string; disabled?: boolean; coolingDown?: boolean; onPress: () => void }
>(function PrimaryButton({ label, hint, disabled, coolingDown, onPress }, ref) {
  return (
    <PressButton
      ref={ref}
      onPress={onPress}
      disabled={disabled}
      // Not `disabled` while cooling down: that would drop keyboard focus from the button.
      aria-disabled={coolingDown || undefined}
      className={cn(
        'flex h-24 w-full min-w-0 select-none flex-col items-center justify-center rounded-lg bg-accent px-4 text-accent-foreground transition-[transform,opacity] duration-150 [touch-action:manipulation] focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:opacity-50 motion-reduce:transition-none lg:h-[72px] lg:flex-1',
        coolingDown && 'scale-[0.99] opacity-60',
      )}
    >
      <span className="text-2xl font-semibold leading-tight sm:text-3xl">{label}</span>
      {/* Key hints are noise on touch-first devices. */}
      {hint && <span className="text-xs font-medium opacity-80 [@media(hover:none)_and_(pointer:coarse)]:hidden">{hint}</span>}
    </PressButton>
  );
});

function SnackbarBar({ snackbar, onDismiss }: { snackbar: Snackbar; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-primary px-3 py-1 text-primary-foreground">
      <span className="min-w-0 flex-1 truncate text-sm">{snackbar.text}</span>
      <button
        type="button"
        onClick={snackbar.onUndo}
        className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-foreground"
      >
        <Undo2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        Undo
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}

/** End of the Behmor countdown (display time + added time), seconds. */
function behmorEnd(log: ConsoleLog): number | undefined {
  if (log.roasterType !== 'behmor-2000ab' || typeof log.startingSettings.lcd !== 'number') return undefined;
  const added = log.controlChanges
    .filter((c) => c.control === 'extend' && typeof c.value === 'number')
    .reduce((sum, c) => sum + (c.value as number), 0);
  return log.startingSettings.lcd + added;
}

/** "FC +0:18 vs reference", "On pace", or the next reference milestone. */
function referenceDelta(log: ConsoleLog, reference: RoastReference | null, elapsedS: number): string | null {
  if (!reference) return null;
  const fc = findEvent(log, 'first_crack');
  const y = findEvent(log, 'yellowing');
  const compare = (label: string, actual: number, ref: number) => {
    const d = actual - ref;
    return Math.abs(d) < 5 ? 'On pace' : `${label} ${formatClockDelta(d)} vs reference`;
  };
  if (fc && reference.firstCrackS) return compare('FC', msToSeconds(fc.t), reference.firstCrackS);
  if (y && reference.yellowingS && !fc) {
    if (reference.firstCrackS && elapsedS > reference.firstCrackS) return `FC due ${formatClock(reference.firstCrackS)}`;
    return compare('Yellow', msToSeconds(y.t), reference.yellowingS);
  }
  if (!y && reference.yellowingS) return `Reference yellow ${formatClock(reference.yellowingS)}`;
  if (!fc && reference.firstCrackS) return `Reference FC ${formatClock(reference.firstCrackS)}`;
  return null;
}
