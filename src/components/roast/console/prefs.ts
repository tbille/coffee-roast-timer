/**
 * Per-device console preferences: unit, shortcuts, audio, first-run prep lines,
 * and the last setup used on each machine. Storage failures degrade to defaults.
 */
import { useCallback, useState } from 'react';
import type { TempUnit } from '@/lib/format';
import type { RoasterType } from '@/types/roaster.types';
import type { StartingSettings } from './model';

const KEY = 'roast_console_prefs:v1';

export interface MachineSetup {
  batchGrams: number;
  starting: StartingSettings;
}

export interface ConsolePrefs {
  unit?: TempUnit;
  shortcuts: boolean;
  audio: Partial<Record<RoasterType, boolean>>;
  prepDismissed: boolean;
  machines: Partial<Record<RoasterType, MachineSetup>>;
}

const DEFAULTS: ConsolePrefs = { shortcuts: true, audio: {}, prepDismissed: false, machines: {} };

function read(): ConsolePrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ConsolePrefs>;
    return {
      ...DEFAULTS,
      ...parsed,
      audio: { ...(parsed.audio ?? {}) },
      machines: { ...(parsed.machines ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

function write(prefs: ConsolePrefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable */
  }
}

export function audioEnabled(prefs: ConsolePrefs, type: RoasterType): boolean {
  return prefs.audio[type] ?? type === 'popcorn-popper';
}

export function useConsolePrefs() {
  const [prefs, setPrefs] = useState<ConsolePrefs>(read);
  const update = useCallback((updater: (p: ConsolePrefs) => ConsolePrefs) => {
    setPrefs((prev) => {
      const next = updater(prev);
      write(next);
      return next;
    });
  }, []);
  return [prefs, update] as const;
}
