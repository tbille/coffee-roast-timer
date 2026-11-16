/**
 * Shared number / time / date formatting. Every number in the UI goes through
 * these helpers so formats do not drift between the console, cards and pages.
 * Render the results with `font-mono tabular-nums`.
 */

export type TempUnit = 'C' | 'F';

const isFiniteNumber = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/**
 * Elapsed ms to whole seconds. The single ms -> seconds rule for the app: floor,
 * like a stopwatch, so the live log, the review card and saved milestones agree.
 */
export function msToSeconds(ms: number): number {
  if (!isFiniteNumber(ms)) return 0;
  return Math.floor(Math.max(0, ms) / 1000);
}

/**
 * Seconds to "m:ss" (minutes are not wrapped into hours: 75:03). Fractional
 * seconds are floored (see msToSeconds); negative values clamp to 0:00.
 */
export function formatClock(seconds: number): string {
  if (!isFiniteNumber(seconds)) return '0:00';
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Milliseconds to "m:ss" (floors, so a running clock never shows a second early). */
export function formatClockMs(ms: number): string {
  if (!isFiniteNumber(ms)) return '0:00';
  return formatClock(msToSeconds(ms));
}

/** Signed seconds to "+m:ss" / "-m:ss" / "0:00", for deltas against a reference. */
export function formatClockDelta(seconds: number): string {
  if (!isFiniteNumber(seconds)) return '0:00';
  const rounded = Math.round(seconds);
  if (rounded === 0) return '0:00';
  return `${rounded > 0 ? '+' : '-'}${formatClock(Math.abs(rounded))}`;
}

/** 12.345 -> "12.3%" (digits default 1). Returns "—" for missing values. */
export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (!isFiniteNumber(value)) return '—';
  return `${value.toFixed(digits)}%`;
}

/** 250 -> "250 g", 249.5 -> "249.5 g". Returns "—" for missing values. */
export function formatGrams(value: number | null | undefined, digits?: number): string {
  if (!isFiniteNumber(value)) return '—';
  const text = digits !== undefined ? value.toFixed(digits) : String(Math.round(value * 10) / 10);
  return `${text} g`;
}

/** Converts a stored °C value for display in the given unit: 200 -> "200 °C" / "392 °F". */
export function formatTemp(celsius: number | null | undefined, unit: TempUnit = 'C'): string {
  if (!isFiniteNumber(celsius)) return '—';
  const value = unit === 'F' ? celsius * 9 / 5 + 32 : celsius;
  return `${Math.round(value)} °${unit}`;
}

export interface FormatDateOptions {
  /** Include the year (default true). */
  year?: boolean;
  /** Include the time of day. */
  time?: boolean;
}

/** ISO string / Date -> "Nov 16, 2026". Returns "" for invalid input. */
export function formatDate(input: string | number | Date | null | undefined, options: FormatDateOptions = {}): string {
  if (input === null || input === undefined || input === '') return '';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const { year = true, time = false } = options;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(year ? { year: 'numeric' } : {}),
    ...(time ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

/**
 * Parses a number typed by a person, accepting a comma decimal separator.
 * "12,5" -> 12.5, " 250 " -> 250, "1 234,5" -> 1234.5, "" / "abc" -> undefined.
 */
export function parseLocaleNumber(input: string | number | null | undefined): number | undefined {
  if (isFiniteNumber(input)) return input;
  if (typeof input !== 'string') return undefined;
  let text = input.trim().replace(/[\s\u00a0']/g, '');
  if (text === '') return undefined;
  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    // Whichever comes last is the decimal separator; the other groups thousands.
    text = lastComma > lastDot ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
  } else if (lastComma > -1) {
    text = text.replace(',', '.');
  }
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(text)) return undefined;
  const value = Number(text);
  return Number.isFinite(value) ? value : undefined;
}

/** Parses "m:ss" or "mm:ss" (or plain seconds) to seconds. "7:42" -> 462. */
export function parseClock(input: string): number | undefined {
  const text = input.trim();
  const match = text.match(/^(\d{1,3}):([0-5]?\d)$/);
  if (match) return Number(match[1]) * 60 + Number(match[2]);
  if (/^\d+$/.test(text)) return Number(text);
  return undefined;
}
