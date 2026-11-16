/**
 * useRoastSession
 *
 * The roast console's clock and log:
 * - a wall-clock timer (accurate in background tabs, millisecond precision)
 * - crash/reload recovery via localStorage (`restoredMs` tells the UI it happened)
 *
 * State is split in two:
 * - `settings`: choices made before roasting (machine, batch, starting settings).
 *   Kept when a new roast starts.
 * - `log`: what was recorded during the roast. Re-seeded on Charge, cleared on reset.
 *
 * There is no pause in the console: pausing hides real roast time and skews the
 * development ratio. `pause`/`resume` stay in the API for compatibility only.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type RoastStatus = 'idle' | 'running' | 'paused' | 'stopped';

interface RoastClock {
  status: RoastStatus;
  /** Wall-clock ms at Charge */
  startedAt: number | null;
  /** Wall-clock ms at Drop */
  endedAt: number | null;
  /** Running time banked by previous run segments */
  accumulatedMs: number;
  /** Wall-clock ms when the current run segment began; null unless running */
  segmentStartedAt: number | null;
}

interface StoredSession<S, L> {
  version: 2;
  savedAt: number;
  clock: RoastClock;
  settings: S;
  log: L;
}

/** Storage key of the /roast console session (also read by the roast-in-progress pill). */
export const ROAST_SESSION_KEY = 'roast_session:v2';

const STORAGE_VERSION = 2;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const TICK_MS = 250;

const IDLE_CLOCK: RoastClock = {
  status: 'idle',
  startedAt: null,
  endedAt: null,
  accumulatedMs: 0,
  segmentStartedAt: null,
};

function runningMs(clock: RoastClock, now: number): number {
  const segment = clock.segmentStartedAt === null ? 0 : Math.max(0, now - clock.segmentStartedAt);
  return clock.accumulatedMs + segment;
}

function readStoredSession<S, L>(key: string): StoredSession<S, L> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession<S, L>;
    if (parsed?.version !== STORAGE_VERSION || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Elapsed ms of the roast persisted under `key` if it is running, else null.
 * Read-only (never clears storage) and wall-clock based, so it is right from any
 * page or tab even though the console that owns the session is not mounted.
 */
export function readRunningElapsedMs(key: string, now: number = Date.now()): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession<unknown, unknown>> | null;
    const clock = parsed?.clock;
    if (parsed?.version !== STORAGE_VERSION || !clock || clock.status !== 'running') return null;
    if (typeof parsed.savedAt !== 'number' || now - parsed.savedAt > MAX_AGE_MS) return null;
    return runningMs(clock, now);
  } catch {
    return null;
  }
}

export interface RoastSession<S, L> {
  status: RoastStatus;
  isRunning: boolean;
  /** Always false in the console; kept for API compatibility */
  isPaused: boolean;
  /** A roast is in progress (running or paused) */
  inProgress: boolean;
  /** Recording controls should be enabled */
  canRecord: boolean;
  /** Elapsed ms at the last render (re-renders 4x per second while running) */
  elapsedMs: number;
  elapsedSeconds: number;
  /** Elapsed ms computed at call time; use it to stamp an event */
  currentElapsedMs: () => number;
  startTime: number | null;
  endTime: number | null;
  /** Elapsed ms at the moment a running/stopped session was restored after a reload; null otherwise */
  restoredMs: number | null;
  dismissRestored: () => void;

  settings: S;
  updateSettings: (patch: Partial<S>) => void;
  log: L;
  /** Updates the log (any status but idle). */
  updateLog: (updater: (log: L) => L) => void;

  /** Charge: t = 0. `seed` builds the fresh log from the current settings. */
  start: (seed?: (settings: S) => Partial<L>) => void;
  /** @deprecated No pause in the console. No-op unless something calls it. */
  pause: () => void;
  /** @deprecated See pause. */
  resume: () => void;
  /** Drop. `atElapsedMs` stops the clock at that elapsed time (stamped at pointer-down). */
  stop: (atElapsedMs?: number) => void;
  /** Undo a Drop: the clock continues as if it had never stopped. */
  undoStop: () => void;
  reset: () => void;
}

export function useRoastSession<S extends object, L extends object>(
  storageKey: string,
  initialSettings: S,
  initialLog: L,
): RoastSession<S, L> {
  // Defaults are captured once so callers can pass object literals.
  const defaults = useRef({ settings: initialSettings, log: initialLog });
  const [restored] = useState(() => readStoredSession<S, L>(storageKey));

  const [clock, setClock] = useState<RoastClock>(restored?.clock ?? IDLE_CLOCK);
  const [settings, setSettings] = useState<S>(() => ({ ...initialSettings, ...restored?.settings }));
  const [log, setLog] = useState<L>(() => ({ ...initialLog, ...restored?.log }));
  const [restoredMs, setRestoredMs] = useState<number | null>(() =>
    restored && restored.clock.status !== 'idle' ? runningMs(restored.clock, Date.now()) : null,
  );
  const [now, setNow] = useState(() => Date.now());

  const clockRef = useRef(clock);
  clockRef.current = clock;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (clock.status !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [clock.status]);

  // Persist anything that is not a pristine idle session.
  useEffect(() => {
    try {
      if (clock.status === 'idle') {
        localStorage.removeItem(storageKey);
        return;
      }
      const session: StoredSession<S, L> = { version: STORAGE_VERSION, savedAt: Date.now(), clock, settings, log };
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch {
      // Storage unavailable (private mode, quota): recovery is best-effort.
    }
  }, [storageKey, clock, settings, log]);

  const currentElapsedMs = useCallback(() => runningMs(clockRef.current, Date.now()), []);

  const start = useCallback((seed?: (settings: S) => Partial<L>) => {
    const t = Date.now();
    setClock({ status: 'running', startedAt: t, endedAt: null, accumulatedMs: 0, segmentStartedAt: t });
    setLog({ ...defaults.current.log, ...seed?.(settingsRef.current) });
    setRestoredMs(null);
    setNow(t);
  }, []);

  const pause = useCallback(() => {
    setClock(c => {
      if (c.status !== 'running') return c;
      return { ...c, status: 'paused', accumulatedMs: runningMs(c, Date.now()), segmentStartedAt: null };
    });
  }, []);

  const resume = useCallback(() => {
    const t = Date.now();
    setClock(c => (c.status === 'paused' ? { ...c, status: 'running', segmentStartedAt: t } : c));
  }, []);

  const stop = useCallback((atElapsedMs?: number) => {
    setClock(c => {
      if (c.status !== 'running' && c.status !== 'paused') return c;
      const t = Date.now();
      const elapsed = runningMs(c, t);
      const at = atElapsedMs !== undefined && atElapsedMs <= elapsed ? atElapsedMs : elapsed;
      // endedAt is the wall-clock moment matching `at`, so undoStop can continue seamlessly.
      return { ...c, status: 'stopped', endedAt: t - (elapsed - at), accumulatedMs: at, segmentStartedAt: null };
    });
  }, []);

  const undoStop = useCallback(() => {
    setClock(c => {
      if (c.status !== 'stopped' || c.endedAt === null) return c;
      return { ...c, status: 'running', endedAt: null, segmentStartedAt: c.endedAt };
    });
    setNow(Date.now());
  }, []);

  const reset = useCallback(() => {
    setClock(IDLE_CLOCK);
    setLog(defaults.current.log);
    setRestoredMs(null);
  }, []);

  const updateSettings = useCallback((patch: Partial<S>) => {
    setSettings(s => ({ ...s, ...patch }));
  }, []);

  const updateLog = useCallback((updater: (log: L) => L) => {
    if (clockRef.current.status === 'idle') return;
    setLog(updater);
  }, []);

  const dismissRestored = useCallback(() => setRestoredMs(null), []);

  const status = clock.status;
  const elapsedMs = runningMs(clock, status === 'running' ? Math.max(now, Date.now()) : Date.now());

  return {
    status,
    isRunning: status === 'running',
    isPaused: status === 'paused',
    inProgress: status === 'running' || status === 'paused',
    canRecord: status === 'running',
    elapsedMs,
    elapsedSeconds: Math.floor(elapsedMs / 1000),
    currentElapsedMs,
    startTime: clock.startedAt,
    endTime: clock.endedAt,
    restoredMs,
    dismissRestored,
    settings,
    updateSettings,
    log,
    updateLog,
    start,
    pause,
    resume,
    stop,
    undoStop,
    reset,
  };
}
