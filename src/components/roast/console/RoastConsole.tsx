/**
 * RoastConsole — the /roast screen: Setup (idle) → Roast (running) → Review (stopped).
 *
 * Machines are configuration (registry `controls` vocabulary) plus a few small
 * machine-specific control components; there is one shell for all of them.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Undo2, X } from 'lucide-react';
import { PostRoastCard } from '@/components/review/PostRoastCard';
import { useRoasting } from '@/contexts/RoastingContext';
import { useAuth } from '@/hooks/useAuth';
import { useAudioCues } from '@/hooks/useAudioCues';
import { useReference } from '@/hooks/useReference';
import { useRoastSession } from '@/hooks/useRoastSession';
import { useWakeLock } from '@/hooks/useWakeLock';
import { supabase } from '@/integrations/supabase/client';
import { formatClockMs, formatTemp, type TempUnit } from '@/lib/format';
import { ROASTER_SPECS } from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';
import type { RoastEventType, RoastReference } from '@/types/roast-session.types';
import {
  EMPTY_LOG,
  EVENT_LABELS,
  buildResult,
  colourCueLabel,
  controlLabel,
  currentControls,
  defaultStartingSettings,
  describeHistory,
  findEvent,
  newRoastId,
  undoLast,
  type ConsoleLog,
  type StartingSettings,
} from './model';
import { audioEnabled, useConsolePrefs, type MachineSetup } from './prefs';
import { RoastView, type Snackbar } from './RoastView';
import { SetupView } from './SetupView';

const STORAGE_KEY = 'roast_session:v2';
const CONTROL_DEBOUNCE_MS = 800;
const UNDO_WINDOW_MS = 5000;
const POPPER_ALERT_S = 180;

export interface RoastConsoleProps {
  /** Machine picked in Setup (RoasterContext; `?roaster=` and landing state already applied) */
  roasterType: RoasterType;
  onRoasterChange: (type: RoasterType) => void;
  /** `?ref=` value */
  refId: string | null;
  onClearRefParam: () => void;
  /** Bumps whenever a link with ?roaster= / ?ref= arrives; resets a finished roast to Setup */
  linkNonce: number;
}

export function RoastConsole({ roasterType: setupRoaster, onRoasterChange, refId, onClearRefParam, linkNonce }: RoastConsoleProps) {
  const session = useRoastSession<Record<string, never>, ConsoleLog>(STORAGE_KEY, {}, EMPTY_LOG);
  const { status, log, updateLog } = session;
  const [prefs, updatePrefs] = useConsolePrefs();
  const { setRoasting } = useRoasting();
  const { user } = useAuth();

  /* ---------------- unit: device preference, else the account default ---------------- */
  const [accountUnit, setAccountUnit] = useState<TempUnit | undefined>();
  useEffect(() => {
    if (prefs.unit || !user) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('default_temperature_unit')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const u = (data as { default_temperature_unit?: string } | null)?.default_temperature_unit;
        if (!cancelled && (u === 'C' || u === 'F')) setAccountUnit(u);
      });
    return () => {
      cancelled = true;
    };
  }, [prefs.unit, user]);
  const unit: TempUnit = prefs.unit ?? accountUnit ?? 'C';

  /* ---------------- machine + setup ---------------- */
  const roasterType: RoasterType = status === 'idle' ? setupRoaster : (log.roasterType ?? setupRoaster);
  const setup: MachineSetup = prefs.machines[setupRoaster] ?? {
    batchGrams: ROASTER_SPECS[setupRoaster].recommendedBatchSize,
    starting: defaultStartingSettings(setupRoaster),
  };
  const setSetup = useCallback(
    (patch: Partial<MachineSetup>) =>
      updatePrefs((p) => {
        const prev = p.machines[setupRoaster] ?? {
          batchGrams: ROASTER_SPECS[setupRoaster].recommendedBatchSize,
          starting: defaultStartingSettings(setupRoaster),
        };
        return { ...p, machines: { ...p.machines, [setupRoaster]: { ...prev, ...patch } } };
      }),
    [setupRoaster, updatePrefs],
  );

  /* ---------------- reference ---------------- */
  const [handoff, setHandoff] = useState<RoastReference | null>(null);
  const fetched = useReference(handoff ? null : refId);
  const setupReference = handoff ?? fetched.reference;
  const clearReference = () => {
    setHandoff(null);
    fetched.clear();
    onClearRefParam();
  };

  /* ---------------- a "Roast again" link while finished: back to Setup ---------------- */
  const seenNonce = useRef(0);
  useEffect(() => {
    if (linkNonce === seenNonce.current) return;
    seenNonce.current = linkNonce;
    if (status === 'stopped') {
      session.reset();
      setHandoff(null);
    } else if (status === 'idle') {
      setHandoff(null);
    }
    // Only react to new links.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkNonce]);

  /* ---------------- focus view, wake lock, audio ---------------- */
  const [focus, setFocus] = useState(true);
  const running = status === 'running';
  useEffect(() => {
    setRoasting(running && focus);
  }, [running, focus, setRoasting]);
  useEffect(() => () => setRoasting(false), [setRoasting]);

  const wake = useWakeLock(running);
  const audioOn = audioEnabled(prefs, roasterType);
  const audio = useAudioCues(audioOn);
  const setAudio = (on: boolean) => updatePrefs((p) => ({ ...p, audio: { ...p.audio, [roasterType]: on } }));

  /* ---------------- announcements + snackbar ---------------- */
  const [announcement, setAnnouncement] = useState('');
  const announce = useCallback((text: string) => {
    // Re-announce identical text by clearing first.
    setAnnouncement('');
    window.setTimeout(() => setAnnouncement(text), 30);
  }, []);
  const [snackbar, setSnackbar] = useState<{ text: string; kind: 'entry' | 'drop' } | null>(null);
  useEffect(() => {
    if (!snackbar) return;
    const id = window.setTimeout(() => setSnackbar(null), UNDO_WINDOW_MS);
    return () => window.clearTimeout(id);
  }, [snackbar]);

  /* ---------------- control changes (debounced per control) ---------------- */
  const [pending, setPending] = useState<Record<string, number>>({});
  const pendingRef = useRef<Record<string, { value: number; t: number; timer: number }>>({});

  const commitControl = useCallback(
    (control: string) => {
      const entry = pendingRef.current[control];
      if (!entry) return;
      window.clearTimeout(entry.timer);
      delete pendingRef.current[control];
      setPending((p) => {
        const { [control]: _done, ...rest } = p;
        return rest;
      });
      updateLog((l) => {
        if (currentControls(l)[control] === entry.value) return l; // net zero (+ then -)
        return {
          ...l,
          controlChanges: [...l.controlChanges, { control, value: entry.value, t: entry.t }],
          history: [...l.history, { kind: 'control', control, t: entry.t }],
        };
      });
      setSnackbar((s) => (s?.kind === 'entry' ? null : s));
    },
    [updateLog],
  );

  const flushControls = useCallback(() => {
    for (const control of Object.keys(pendingRef.current)) commitControl(control);
  }, [commitControl]);

  useEffect(
    () => () => {
      for (const entry of Object.values(pendingRef.current)) window.clearTimeout(entry.timer);
    },
    [],
  );

  const onControl = (control: string, value: number) => {
    if (!session.canRecord) return;
    const t = session.currentElapsedMs();
    const existing = pendingRef.current[control];
    if (existing) window.clearTimeout(existing.timer);
    pendingRef.current[control] = {
      value,
      t: existing?.t ?? t, // stamped at the first press of a burst
      timer: window.setTimeout(() => commitControl(control), CONTROL_DEBOUNCE_MS),
    };
    setPending((p) => ({ ...p, [control]: value }));
  };

  const onPress = (control: string, value: number | string) => {
    if (!session.canRecord) return;
    const t = session.currentElapsedMs();
    updateLog((l) => ({
      ...l,
      controlChanges: [...l.controlChanges, { control, value, t }],
      history: [...l.history, { kind: 'control', control, t }],
    }));
    setSnackbar(null);
    announce(`${controlLabel(control, value, unit)} at ${formatClockMs(t)}`);
  };

  /* ---------------- events ---------------- */
  const primaryRef = useRef<HTMLButtonElement>(null);
  const [focusPrimary, setFocusPrimary] = useState(false);
  useEffect(() => {
    if (!focusPrimary || !running) return;
    primaryRef.current?.focus();
    setFocusPrimary(false);
  }, [focusPrimary, running]);

  const charge = () => {
    audio.prime();
    const batchGrams = setup.batchGrams;
    const startingSettings: StartingSettings = { ...setup.starting };
    session.start(() => ({
      id: newRoastId(),
      roasterType: setupRoaster,
      batchGrams,
      startingSettings,
      reference: setupReference ?? null,
    }));
    setFocus(true);
    setFocusPrimary(true);
    setSnackbar(null);
    announce('Roast started. Timer running.');
  };

  const onEvent = (type: RoastEventType, t: number) => {
    if (!session.canRecord || findEvent(log, type)) return;
    if (type === 'second_crack' && !findEvent(log, 'first_crack')) return;
    if (type === 'yellowing' && findEvent(log, 'first_crack')) return;
    if (type === 'drop' && !(findEvent(log, 'yellowing') || log.yellowingSkipped || findEvent(log, 'first_crack'))) return;
    if (type === 'drop') flushControls();
    updateLog((l) =>
      l.events.some((e) => e.type === type)
        ? l
        : { ...l, events: [...l.events, { type, t }], history: [...l.history, { kind: 'event', type, t }] },
    );
    const text = `${EVENT_LABELS[type]} at ${formatClockMs(t)}`;
    announce(type === 'drop' ? `Dropped at ${formatClockMs(t)}. Roast stopped.` : text);
    audio.play(type === 'drop' ? 'drop' : 'event');
    setSnackbar({ text: type === 'drop' ? `Dropped at ${formatClockMs(t)}` : text, kind: type === 'drop' ? 'drop' : 'entry' });
    if (type === 'drop') session.stop(t);
  };

  const onSkipYellowing = (t: number) => {
    if (!session.canRecord || log.yellowingSkipped) return;
    updateLog((l) => ({ ...l, yellowingSkipped: true, history: [...l.history, { kind: 'skip', t }] }));
    setSnackbar({ text: 'Yellowing skipped', kind: 'entry' });
  };

  const onReading = (beanC: number, envC?: number, voice?: boolean) => {
    if (!session.canRecord) return;
    const t = session.currentElapsedMs();
    updateLog((l) => ({
      ...l,
      readings: [...l.readings, { t, beanC, ...(envC !== undefined ? { envC } : {}) }],
      voiceReadings: voice ? [...l.voiceReadings, t] : l.voiceReadings,
      history: [...l.history, { kind: 'reading', t }],
    }));
    setSnackbar(null);
    announce(`${formatTemp(beanC, unit)} logged at ${formatClockMs(t)}`);
  };

  const onColourCue = (color: string) => {
    if (!session.canRecord) return;
    const t = session.currentElapsedMs();
    updateLog((l) => ({ ...l, colourCues: [...l.colourCues, { t, color }], history: [...l.history, { kind: 'cue', t }] }));
    setSnackbar(null);
    announce(`${colourCueLabel(color)} at ${formatClockMs(t)}`);
  };

  const undoDrop = () => {
    session.undoStop();
    updateLog((l) => {
      const last = l.history[l.history.length - 1];
      const history = last?.kind === 'event' && last.type === 'drop' ? l.history.slice(0, -1) : l.history;
      return { ...l, events: l.events.filter((e) => e.type !== 'drop'), history };
    });
    setFocus(true);
    setFocusPrimary(true);
    setSnackbar(null);
    announce('Drop undone. Timer running.');
  };

  const onUndo = () => {
    if (status === 'stopped') {
      undoDrop();
      return;
    }
    if (!session.canRecord) return;
    const last = log.history[log.history.length - 1];
    if (!last) return;
    updateLog(undoLast);
    setSnackbar(null);
    announce(`Undone: ${describeHistory(last, log, unit) ?? 'last entry'}`);
  };

  /* ---------------- popcorn popper 3:00 safety cue ---------------- */
  const alerted = useRef<string | null>(null);
  const elapsedS = session.elapsedSeconds;
  const isPopper = roasterType === 'popcorn-popper';
  useEffect(() => {
    if (!running || !isPopper || elapsedS < POPPER_ALERT_S || alerted.current === log.id) return;
    alerted.current = log.id;
    // A restored roast already past 3:30 does not beep again.
    if (elapsedS > POPPER_ALERT_S + 30) return;
    audio.play('alert');
    announce('3 minutes. Listen for first crack.');
  }, [running, isPopper, elapsedS, log.id, audio, announce]);
  const notice =
    isPopper && running && !findEvent(log, 'first_crack') && elapsedS >= POPPER_ALERT_S && elapsedS < POPPER_ALERT_S + 90
      ? '3:00 — listen for first crack. Never leave the popper.'
      : null;

  /* ---------------- review ---------------- */
  const durationMs = session.elapsedMs;
  const result = useMemo(
    () => (status === 'stopped' && session.startTime !== null ? buildResult(log, session.startTime, durationMs) : null),
    [status, log, session.startTime, durationMs],
  );

  const onDiscard = () => {
    session.reset();
    setSnackbar(null);
  };
  const onNextBatch = (reference: RoastReference) => {
    const type = log.roasterType;
    session.reset();
    setSnackbar(null);
    if (type) onRoasterChange(type);
    onClearRefParam();
    setHandoff(reference);
    window.scrollTo({ top: 0 });
  };

  /* ---------------- render ---------------- */
  if (status === 'running' || status === 'paused') {
    const sb: Snackbar | null = snackbar ? { text: snackbar.text, onUndo } : null;
    return (
      <>
        <RoastView
          log={log}
          elapsedMs={session.elapsedMs}
          unit={unit}
          focus={focus}
          onFocusChange={setFocus}
          wake={wake}
          restoredMs={session.restoredMs}
          onDismissRestored={session.dismissRestored}
          reference={log.reference}
          values={{ ...currentControls(log), ...pending }}
          stamp={session.currentElapsedMs}
          onEvent={onEvent}
          onSkipYellowing={onSkipYellowing}
          onUndo={onUndo}
          onReading={onReading}
          onControl={onControl}
          onPress={onPress}
          onColourCue={onColourCue}
          shortcuts={prefs.shortcuts}
          onShortcutsChange={(on) => updatePrefs((p) => ({ ...p, shortcuts: on }))}
          audio={audioOn}
          onAudioChange={setAudio}
          snackbar={sb}
          onDismissSnackbar={() => setSnackbar(null)}
          announcement={announcement}
          notice={notice}
          primaryRef={primaryRef}
        />
      </>
    );
  }

  if (status === 'stopped' && result) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>
        {session.restoredMs !== null && (
          <p className="mb-4 rounded-md border border-border bg-muted px-3 py-2 text-sm" role="status">
            Roast restored — <span className="font-mono tabular-nums">{formatClockMs(session.restoredMs)}</span>
          </p>
        )}
        {snackbar?.kind === 'drop' && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-primary px-3 py-1 text-primary-foreground">
            <span className="min-w-0 flex-1 text-sm">{snackbar.text}</span>
            <button
              type="button"
              onClick={undoDrop}
              className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              <Undo2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Undo drop
            </button>
            <button
              type="button"
              onClick={() => setSnackbar(null)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        )}
        <PostRoastCard key={result.id} result={result} reference={log.reference} onDiscard={onDiscard} onNextBatch={onNextBatch} />
      </div>
    );
  }

  const referenceSettingsUsable =
    !!setupReference &&
    (setupReference.roasterType === setupRoaster) &&
    (!!setupReference.batchGrams || !!setupReference.startingSettings);

  return (
    <SetupView
      roasterType={setupRoaster}
      onRoasterChange={onRoasterChange}
      batchGrams={setup.batchGrams}
      onBatchChange={(batchGrams) => setSetup({ batchGrams })}
      starting={setup.starting}
      onStartingChange={(patch) => setSetup({ starting: { ...setup.starting, ...patch } })}
      unit={unit}
      onUnitChange={(u) => updatePrefs((p) => ({ ...p, unit: u }))}
      audio={audioEnabled(prefs, setupRoaster)}
      onAudioChange={(on) => updatePrefs((p) => ({ ...p, audio: { ...p.audio, [setupRoaster]: on } }))}
      reference={setupReference}
      referenceLoading={!handoff && fetched.loading}
      referenceError={handoff ? null : fetched.error}
      onClearReference={clearReference}
      onUseReferenceSettings={
        referenceSettingsUsable
          ? () =>
              setSetup({
                ...(setupReference?.batchGrams ? { batchGrams: setupReference.batchGrams } : {}),
                starting: { ...setup.starting, ...knownSettings(setupRoaster, setupReference?.startingSettings) },
              })
          : undefined
      }
      showPrep={!prefs.prepDismissed}
      onDismissPrep={() => updatePrefs((p) => ({ ...p, prepDismissed: true }))}
      onCharge={charge}
    />
  );
}

/** Keeps only starting settings this machine understands, with the right types. */
function knownSettings(type: RoasterType, settings: StartingSettings | undefined): StartingSettings {
  if (!settings) return {};
  const defaults = defaultStartingSettings(type);
  const out: StartingSettings = {};
  for (const [key, value] of Object.entries(settings)) {
    if (!(key in defaults) || typeof value !== typeof defaults[key]) continue;
    const control = ROASTER_SPECS[type].controls?.find((c) => c.id === key);
    if (control && typeof value === 'number' && (value < control.min || value > control.max)) continue;
    out[key] = value;
  }
  return out;
}
