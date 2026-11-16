/**
 * Roasts kept on this device until they are saved to the account.
 *
 * - Stored as `RoastDraft[]` under `roast_drafts:v1` in localStorage.
 * - Every write dispatches `roast-drafts-changed` on `window` (same tab);
 *   other tabs are notified by the native `storage` event.
 * - Storage can be unavailable (private mode, quota, blocked site data):
 *   every access is wrapped and degrades to an empty list / no-op.
 */
import type { RoastDraft } from '@/types/roast-session.types';
import { ROAST_SESSION_KEY, clearStoredSessionFor } from '@/hooks/useRoastSession';

export const DRAFTS_STORAGE_KEY = 'roast_drafts:v1';
export const DRAFTS_CHANGED_EVENT = 'roast-drafts-changed';

/** Prefix used for references that only exist on this device. */
export const LOCAL_REF_PREFIX = 'local:';

/** Ids of roasts the person deleted or discarded (most recent last), so nothing re-drafts them. */
const DELETED_STORAGE_KEY = 'roast_drafts_deleted:v1';
const MAX_DELETED = 50;

/** Synced drafts are dropped from the device this long after they reached the account. */
const SYNCED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const isDraft = (value: unknown): value is RoastDraft => {
  if (!value || typeof value !== 'object') return false;
  const d = value as Partial<RoastDraft>;
  return !!d.result && typeof d.result.id === 'string' && typeof d.createdAt === 'number';
};

function read(): RoastDraft[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isDraft).map((d) => ({ ...d, details: d.details ?? {} }));
  } catch {
    return [];
  }
}

function write(drafts: RoastDraft[]): boolean {
  try {
    window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    return true;
  } catch {
    return false;
  } finally {
    notify();
  }
}

function notify() {
  try {
    window.dispatchEvent(new Event(DRAFTS_CHANGED_EVENT));
  } catch {
    /* no window */
  }
}

/** All drafts, newest first. */
export function listDrafts(): RoastDraft[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getDraft(id: string): RoastDraft | undefined {
  const key = id.startsWith(LOCAL_REF_PREFIX) ? id.slice(LOCAL_REF_PREFIX.length) : id;
  return read().find((d) => d.result.id === key);
}

/**
 * Inserts or replaces the draft with the same `result.id`. Keeps the stored
 * `createdAt` and `syncedAt` (only markSynced changes it), and stamps `updatedAt`. Returns false when the
 * device refused the write (storage full or blocked).
 */
export function upsertDraft(draft: RoastDraft): boolean {
  const drafts = read();
  const index = drafts.findIndex((d) => d.result.id === draft.result.id);
  const now = Date.now();
  if (index >= 0) {
    const prev = drafts[index];
    drafts[index] = {
      ...draft,
      createdAt: prev.createdAt,
      updatedAt: now,
    };
    // Only markSynced moves the stamp: a stale in-memory copy must not overwrite it.
    if (prev.syncedAt !== undefined) drafts[index].syncedAt = prev.syncedAt;
    else delete drafts[index].syncedAt;
  } else {
    drafts.push({ ...draft, createdAt: draft.createdAt || now, updatedAt: now });
  }
  // Synced copies only serve "Roast again" from this device; keep them a while, then let go.
  const pruned = drafts.filter(
    (d) => d.result.id === draft.result.id || !d.syncedAt || now - d.syncedAt < SYNCED_RETENTION_MS,
  );
  return write(pruned);
}

export function deleteDraft(id: string): void {
  const drafts = read();
  const next = drafts.filter((d) => d.result.id !== id);
  if (next.length !== drafts.length) write(next);
}

function readDeleted(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(DELETED_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/** True when the roast was deleted or discarded on this device. */
export function wasDeleted(id: string): boolean {
  return readDeleted().includes(id);
}

/**
 * The person deleted or discarded this roast: drop its draft, remember the id so a
 * remounted review card does not draft it again, and clear the console session
 * still holding it (a finished roast stays there for up to 24 h).
 */
export function forgetRoast(id: string): void {
  deleteDraft(id);
  try {
    const ids = [...readDeleted().filter((x) => x !== id), id].slice(-MAX_DELETED);
    window.localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable */
  }
  clearStoredSessionFor(ROAST_SESSION_KEY, id);
}

/** Records that the draft now exists in Supabase (same id). */
export function markSynced(id: string, at: number = Date.now()): void {
  const drafts = read();
  const index = drafts.findIndex((d) => d.result.id === id);
  if (index < 0) return;
  drafts[index] = { ...drafts[index], syncedAt: at };
  write(drafts);
}

/** Drafts not yet saved to the account. */
export function listUnsyncedDrafts(): RoastDraft[] {
  return listDrafts().filter((d) => !d.syncedAt);
}

/** True when the draft was edited after it was last synced. */
export function isDirty(draft: RoastDraft): boolean {
  return !draft.syncedAt || draft.updatedAt > draft.syncedAt;
}
