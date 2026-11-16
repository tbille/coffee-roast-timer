/**
 * useWakeLock — keeps the screen on while `active` is true.
 *
 * Requests a screen wake lock, re-acquires it when the page becomes visible again
 * (browsers release it whenever the tab is hidden), and releases it when `active`
 * turns false or the component unmounts. Degrades silently where unsupported.
 */
import { useEffect, useRef, useState } from 'react';

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
}

interface WakeLockLike {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>;
}

const getWakeLock = (): WakeLockLike | undefined =>
  typeof navigator !== 'undefined' ? (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock : undefined;

export interface WakeLockState {
  /** The browser has the Screen Wake Lock API */
  supported: boolean;
  /** A lock is currently held */
  locked: boolean;
}

export function useWakeLock(active: boolean): WakeLockState {
  const [supported] = useState(() => !!getWakeLock());
  const [locked, setLocked] = useState(false);
  const sentinel = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    const api = getWakeLock();
    if (!active || !api) return;
    let cancelled = false;

    const acquire = async () => {
      if (document.visibilityState !== 'visible') return;
      if (sentinel.current && !sentinel.current.released) return;
      try {
        const lock = await api.request('screen');
        if (cancelled) {
          void lock.release();
          return;
        }
        sentinel.current = lock;
        setLocked(true);
        lock.addEventListener('release', () => {
          if (sentinel.current === lock) setLocked(false);
        });
      } catch {
        // Denied (battery saver, not visible, permissions policy): the status text says so.
        setLocked(false);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      const lock = sentinel.current;
      sentinel.current = null;
      setLocked(false);
      if (lock && !lock.released) void lock.release().catch(() => undefined);
    };
  }, [active]);

  return { supported, locked };
}
