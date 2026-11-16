/**
 * useAudioCues — short, soft WebAudio tones for roast events.
 *
 * The AudioContext is created lazily on the first `prime()` / `play()` call, which
 * should happen inside a user gesture (Charge) so mobile browsers allow sound.
 */
import { useCallback, useEffect, useRef } from 'react';

export type CueKind = 'event' | 'drop' | 'alert';

const TONES: Record<CueKind, Array<{ freq: number; at: number; dur: number }>> = {
  event: [{ freq: 880, at: 0, dur: 0.18 }],
  drop: [
    { freq: 660, at: 0, dur: 0.16 },
    { freq: 990, at: 0.2, dur: 0.22 },
  ],
  // Safety reminder (popcorn popper at 3:00): three clear beeps.
  alert: [
    { freq: 1000, at: 0, dur: 0.2 },
    { freq: 1000, at: 0.35, dur: 0.2 },
    { freq: 1000, at: 0.7, dur: 0.2 },
  ],
};

type AudioCtor = typeof AudioContext;

export function useAudioCues(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const context = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) {
        const Ctor: AudioCtor | undefined =
          window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
        if (!Ctor) return null;
        ctxRef.current = new Ctor();
      }
      if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  /** Unlock audio inside a user gesture, without making a sound. */
  const prime = useCallback(() => {
    if (enabledRef.current) context();
  }, [context]);

  const play = useCallback(
    (kind: CueKind) => {
      if (!enabledRef.current) return;
      const ctx = context();
      if (!ctx) return;
      try {
        const start = ctx.currentTime + 0.01;
        for (const tone of TONES[kind]) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = tone.freq;
          gain.gain.setValueAtTime(0.0001, start + tone.at);
          gain.gain.exponentialRampToValueAtTime(0.25, start + tone.at + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.at + tone.dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start + tone.at);
          osc.stop(start + tone.at + tone.dur + 0.02);
        }
      } catch {
        // Audio unavailable: the visual cue is enough.
      }
    },
    [context],
  );

  useEffect(
    () => () => {
      void ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
    },
    [],
  );

  return { play, prime };
}
