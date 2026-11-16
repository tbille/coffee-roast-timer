import { Undo2 } from 'lucide-react';
import { formatClockMs } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { LogLine } from './model';

export interface EventLogProps {
  lines: LogLine[];
  /** Key of the line Undo removes (the latest logged entry) */
  undoKey?: string;
  onUndo: () => void;
  max?: number;
  className?: string;
}

/** Last few things logged, newest first. Undo sits on the latest entry. */
export function EventLog({ lines, undoKey, onUndo, max = 4, className }: EventLogProps) {
  const recent = lines.slice(-max).reverse();
  return (
    <section aria-label="Roast log" className={cn('space-y-1', className)}>
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Log</h2>
      {recent.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Events and changes appear here.</p>
      ) : (
        <ol className="divide-y divide-border">
          {recent.map((line) => (
            <li key={line.key} className="flex min-h-10 items-center gap-3 py-1">
              <span className="w-14 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">{formatClockMs(line.t)}</span>
              <span className={cn('min-w-0 flex-1 truncate text-sm', line.kind === 'event' ? 'font-semibold text-foreground' : 'text-foreground')}>
                {line.text}
              </span>
              {line.key === undoKey && (
                <button
                  type="button"
                  onClick={onUndo}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Undo2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  Undo
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
