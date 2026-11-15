/**
 * useRoastSession
 *
 * Shared state for every roaster mode on /roast:
 * - a wall-clock timer (accurate in background tabs, correct across any number of pauses)
 * - crack event recording
 * - crash/reload recovery via localStorage
 *
 * State is split in two:
 * - `settings`: choices made before/while roasting (batch size, profile, heat level...).
 *   Kept when a new roast starts.
 * - `log`: what was recorded during the roast (temperatures, cracks...).
 *   Cleared when a new roast starts or the session is reset.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CrackEvent } from '@/types/roast-data.types';

export type RoastStatus = 'idle' | 'running' | 'paused' | 'stopped';

interface RoastClock {
  status: RoastStatus;
  /** Wall-clock ms when Start was pressed */
  startedAt: number | null;
  /** Wall-clock ms when Stop was pressed */
  endedAt: number | null;
  /** Running time banked by previous run segments (excludes pauses) */
  accumulatedMs: number;
  /** Wall-clock ms when the current run segment began; null unless running */
  segmentStartedAt: number | null;
}

interface StoredSession<S, L> {
  version: 1;
  savedAt: number;
  clock: RoastClock;
  settings: S;
  log: L;
}

const STORAGE_VERSION = 1;
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

export interface RoastSession<S, L extends { crackEvents: CrackEvent[] }> {
  status: RoastStatus;
  /** Timer is ticking */
  isRunning: boolean;
  isPaused: boolean;
  /** A roast is in progress (running or paused) */
  inProgress: boolean;
  /** Recording controls should be enabled */
  canRecord: boolean;
  elapsedSeconds: number;
  /** Elapsed seconds computed at call time; use when recording an event */
  currentElapsed: () => number;
  startTime: number | null;
  endTime: number | null;

  settings: S;
  updateSettings: (patch: Partial<S>) => void;
  log: L;
  /**
   * Add something to the log, stamped with the current elapsed time.
   * Ignored unless the timer is running. Returns whether it was recorded.
   */
  record: (updater: (log: L, elapsedSeconds: number) => L) => boolean;

  firstCrack: CrackEvent | undefined;
  secondCrack: CrackEvent | undefined;
  recordCrack: (type: CrackEvent['type'], extra?: Pick<CrackEvent, 'targetTemp' | 'currentTemp'>) => void;

  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

export function useRoastSession<S extends object, L extends { crackEvents: CrackEvent[] }>(
  storageKey: string,
  initialSettings: S,
  initialLog: L,
  options: {
    /** Entries to seed the log with when a roast starts (e.g. initial heat/fan settings) */
    seedLogOnStart?: (settings: S) => Partial<L>;
  } = {},
): RoastSession<S, L> {
  // Defaults are captured once so callers can pass object literals.
  const defaults = useRef({ settings: initialSettings, log: initialLog });
  const [restored] = useState(() => readStoredSession<S, L>(storageKey));

  const [clock, setClock] = useState<RoastClock>(restored?.clock ?? IDLE_CLOCK);
  const [settings, setSettings] = useState<S>(() => ({ ...initialSettings, ...restored?.settings }));
  const [log, setLog] = useState<L>(() => ({ ...initialLog, ...restored?.log }));
  // Only used to re-render once per elapsed second while the timer runs.
  const [, setTick] = useState(0);

  const clockRef = useRef(clock);
  clockRef.current = clock;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const seedRef = useRef(options.seedLogOnStart);
  seedRef.current = options.seedLogOnStart;

  // Re-render while running. Elapsed time is derived from the wall clock,
  // so throttled intervals (background tabs) never cause drift.
  useEffect(() => {
    if (clock.status !== 'running') return;
    const tick = () => setTick(Math.floor(runningMs(clockRef.current, Date.now()) / 1000));
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [clock.status]);

  // Persist anything that is not a pristine idle session.
  useEffect(() => {
    try {
      if (clock.status === 'idle') {
        localStorage.removeItem(storageKey);
        return;
      }
      const session: StoredSession<S, L> = {
        version: STORAGE_VERSION,
        savedAt: Date.now(),
        clock,
        settings,
        log,
      };
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch {
      // Storage unavailable (private mode, quota): recovery is best-effort.
    }
  }, [storageKey, clock, settings, log]);

  const currentElapsed = useCallback(
    () => Math.floor(runningMs(clockRef.current, Date.now()) / 1000),
    [],
  );

  const start = useCallback(() => {
    const t = Date.now();
    setClock({ status: 'running', startedAt: t, endedAt: null, accumulatedMs: 0, segmentStartedAt: t });
    setLog({ ...defaults.current.log, ...seedRef.current?.(settingsRef.current) });
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

  const stop = useCallback(() => {
    setClock(c => {
      if (c.status !== 'running' && c.status !== 'paused') return c;
      const t = Date.now();
      return { ...c, status: 'stopped', endedAt: t, accumulatedMs: runningMs(c, t), segmentStartedAt: null };
    });
  }, []);

  const reset = useCallback(() => {
    setClock(IDLE_CLOCK);
    setLog(defaults.current.log);
  }, []);

  const updateSettings = useCallback((patch: Partial<S>) => {
    setSettings(s => ({ ...s, ...patch }));
  }, []);

  const record = useCallback<RoastSession<S, L>['record']>((updater) => {
    if (clockRef.current.status !== 'running') return false;
    const time = currentElapsed();
    setLog(l => updater(l, time));
    return true;
  }, [currentElapsed]);

  const recordCrack = useCallback<RoastSession<S, L>['recordCrack']>((type, extra) => {
    record((l, time) => {
      if (l.crackEvents.some(e => e.type === type)) return l;
      if (type === 'second' && !l.crackEvents.some(e => e.type === 'first')) return l;
      return { ...l, crackEvents: [...l.crackEvents, { type, time, timestamp: Date.now(), ...extra }] };
    });
  }, [record]);

  const status = clock.status;

  return {
    status,
    isRunning: status === 'running',
    isPaused: status === 'paused',
    inProgress: status === 'running' || status === 'paused',
    canRecord: status === 'running',
    elapsedSeconds: Math.floor(runningMs(clock, Date.now()) / 1000),
    currentElapsed,
    startTime: clock.startedAt,
    endTime: clock.endedAt,
    settings,
    updateSettings,
    log,
    record,
    firstCrack: log.crackEvents.find(e => e.type === 'first'),
    secondCrack: log.crackEvents.find(e => e.type === 'second'),
    recordCrack,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
