/**
 * Helpers for `roast_profiles.visibility` ('private' | 'unlisted' | 'public').
 *
 * The column is added by a migration that may land after a frontend deploy, so
 * every query that reads, filters or writes it falls back to the old behaviour
 * when the database answers "column does not exist".
 */
import { isRoastVisibility, type RoastVisibility } from '@/types/roast-session.types';

type MaybeError = { code?: string; message?: string } | null | undefined;

/** PostgREST (PGRST204 schema cache) / Postgres (42703) errors for a missing `visibility` column. */
export function isMissingVisibilityColumn(error: MaybeError): boolean {
  if (!error) return false;
  if (error.code !== 'PGRST204' && error.code !== '42703') return false;
  return /visibility/i.test(error.message ?? '');
}

let warned = false;
export function warnMissingVisibility(context: string) {
  if (warned) return;
  warned = true;
  console.warn(`[${context}] roast_profiles.visibility does not exist yet; continuing without it.`);
}

/**
 * Runs a query that uses `visibility`; when the column does not exist yet,
 * runs it once more without it (`run(false)`).
 */
export async function withVisibilityFallback<T extends { error: MaybeError }>(
  context: string,
  run: (hasColumn: boolean) => PromiseLike<T>,
): Promise<T> {
  const first = await run(true);
  if (!isMissingVisibilityColumn(first.error)) return first;
  warnMissingVisibility(context);
  return run(false);
}

/** A row's visibility. Rows from before the column existed are public. */
export function rowVisibility(row: unknown): RoastVisibility {
  const v = (row as { visibility?: unknown } | null)?.visibility;
  return isRoastVisibility(v) ? v : 'public';
}
