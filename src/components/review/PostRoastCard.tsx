/**
 * PostRoastCard — Review state of the roast console (replaces SaveRoastDialog).
 * CONTRACT (owned by the Review agent; props are fixed, implementation is a stub):
 * - Auto-drafts `result` to the device on mount (src/lib/drafts.ts), nothing required.
 * - onDiscard: user confirmed discard; the console resets to Setup.
 * - onNextBatch: roast saved (or drafted); the console returns to Setup with this roast as the reference.
 */
import type { RoastReference, RoastResult } from '@/types/roast-session.types';

export interface PostRoastCardProps {
  result: RoastResult;
  /** Reference followed during this roast, to show deltas in the summary */
  reference?: RoastReference | null;
  onDiscard: () => void;
  onNextBatch: (reference: RoastReference) => void;
}

export function PostRoastCard({ result }: PostRoastCardProps) {
  return <section aria-label="Review roast">Roast {result.id} finished.</section>;
}
