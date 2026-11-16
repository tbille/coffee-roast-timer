import { forwardRef, useId, useState, type FormEvent } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseLocaleNumber, type TempUnit } from '@/lib/format';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { detectCommand, parseSpokenNumber, type VoiceCommand } from './voice';

const toC = (value: number, unit: TempUnit) => (unit === 'F' ? ((value - 32) * 5) / 9 : value);
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Plausible range for a probe reading during a roast, °C. */
const MIN_C = 0;
const MAX_C = 350;

export interface TempFormProps {
  label: string;
  unit: TempUnit;
  /** Show a second field for the environment temperature (Hottop) */
  withEnv?: boolean;
  disabled?: boolean;
  onLog: (beanC: number, envC?: number) => void;
  /** KALDI: spoken readings and events */
  voice?: { onReading: (beanC: number) => void; onCommand: (command: VoiceCommand) => void };
  className?: string;
}

const inputClass =
  'h-12 w-full min-w-0 rounded-md border border-input bg-background px-3 font-mono text-lg tabular-nums text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive';

/** Optional temperature reading. Enter submits. Values are converted to °C before logging. */
export const TempForm = forwardRef<HTMLInputElement, TempFormProps>(function TempForm(
  { label, unit, withEnv, disabled, onLog, voice, className },
  ref,
) {
  const id = useId();
  const [bean, setBean] = useState('');
  const [env, setEnv] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parse = (text: string): number | null | undefined => {
    if (text.trim() === '') return undefined;
    const n = parseLocaleNumber(text);
    if (n === undefined) return null;
    const c = toC(n, unit);
    return c < MIN_C || c > MAX_C ? null : round1(c);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const beanC = parse(bean);
    const envC = withEnv ? parse(env) : undefined;
    if (beanC === undefined) {
      setError(`Type a ${label.toLowerCase()} first.`);
      return;
    }
    if (beanC === null || envC === null) {
      setError('That does not look like a roast temperature.');
      return;
    }
    setError(null);
    onLog(beanC, envC ?? undefined);
    setBean('');
    setEnv('');
  };

  const errorId = `${id}-error`;

  return (
    <form onSubmit={submit} className={cn('space-y-1.5', className)} noValidate>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor={`${id}-bean`} className="text-sm font-medium text-foreground">
            {label} <span className="text-muted-foreground">(°{unit}, optional)</span>
          </label>
          <input
            ref={ref}
            id={`${id}-bean`}
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            value={bean}
            onChange={(e) => setBean(e.target.value)}
            disabled={disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? errorId : undefined}
            placeholder={unit === 'F' ? '390' : '200'}
            className={inputClass}
          />
        </div>
        {withEnv && (
          <div className="w-24 shrink-0 space-y-1.5">
            <label htmlFor={`${id}-env`} className="text-sm font-medium text-foreground">
              Env
            </label>
            <input
              id={`${id}-env`}
              inputMode="decimal"
              autoComplete="off"
              enterKeyHint="done"
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              disabled={disabled}
              placeholder={unit === 'F' ? '430' : '220'}
              className={inputClass}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={disabled}
          className="h-12 shrink-0 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Log
        </button>
        {voice && <VoiceToggle unit={unit} disabled={disabled} {...voice} />}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
});

function VoiceToggle({
  unit,
  disabled,
  onReading,
  onCommand,
}: {
  unit: TempUnit;
  disabled?: boolean;
  onReading: (beanC: number) => void;
  onCommand: (command: VoiceCommand) => void;
}) {
  const voice = useVoiceInput(({ transcript, isFinal }) => {
    if (!isFinal) return;
    const command = detectCommand(transcript);
    if (command) {
      onCommand(command);
      return;
    }
    const n = parseSpokenNumber(transcript);
    if (n === null) return;
    const c = round1(toC(n, unit));
    if (c >= MIN_C && c <= MAX_C) onReading(c);
  });
  if (!voice.isSupported) return null;
  const Icon = voice.isListening ? MicOff : Mic;
  return (
    <button
      type="button"
      onClick={voice.isListening ? voice.stopListening : voice.startListening}
      disabled={disabled}
      aria-pressed={voice.isListening}
      className={cn(
        'inline-flex h-12 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
        voice.isListening ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background text-foreground hover:bg-muted',
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      <span className="sr-only sm:not-sr-only">{voice.isListening ? 'Listening' : 'Voice'}</span>
    </button>
  );
}
