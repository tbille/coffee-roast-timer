import { useState, useEffect, useRef, useCallback } from 'react';

export interface VoiceInputResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- Web Speech API has no TS lib types */
const getRecognitionCtor = (): any =>
  typeof window === 'undefined' ? undefined : (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

/** True when the browser has the Web Speech API (not on iOS home-screen apps, Firefox). */
export const isVoiceInputSupported = () => !!getRecognitionCtor();

/**
 * Web Speech API recognition with continuous listening.
 * Callbacks are read through refs, so passing inline functions is fine.
 */
export const useVoiceInput = (
  onResult?: (result: VoiceInputResult) => void,
  onError?: (error: string) => void,
): UseVoiceInputReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(isVoiceInputSupported);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const SpeechRecognition = getRecognitionCtor();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const piece: string = result[0].transcript;
        text += piece;
        onResultRef.current?.({ transcript: piece.trim(), confidence: result[0].confidence, isFinal: !!result.isFinal });
      }
      setTranscript(text.trim());
    };

    recognition.onerror = (event: any) => {
      const messages: Record<string, string> = {
        'no-speech': 'No speech detected.',
        'audio-capture': 'Microphone not available.',
        'not-allowed': 'Microphone permission denied.',
        network: 'Network error.',
      };
      const message = messages[event.error] ?? `Voice input error: ${event.error}`;
      setError(message);
      setIsListening(false);
      onErrorRef.current?.(message);
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.abort?.();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const message = 'Voice input is not supported in this browser.';
      setError(message);
      onErrorRef.current?.(message);
      return;
    }
    try {
      recognitionRef.current.start();
    } catch {
      // Already started
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return { isListening, isSupported, transcript, error, startListening, stopListening, resetTranscript };
};
/* eslint-enable @typescript-eslint/no-explicit-any */
