import { useId } from 'react';
import { CircleHelp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const SHORTCUTS: Array<{ keys: string; action: string }> = [
  { keys: 'Space / Enter', action: 'Next event (the big button)' },
  { keys: 'Y', action: 'Yellowing' },
  { keys: 'F', action: 'First crack' },
  { keys: 'S', action: 'Second crack' },
  { keys: 'D', action: 'Drop' },
  { keys: 'T', action: 'Type a temperature' },
  { keys: 'U', action: 'Undo the last entry' },
  { keys: 'Esc', action: 'Exit focus view' },
  { keys: '?', action: 'Open this list' },
];

export interface ShortcutHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: boolean;
  onShortcutsChange: (on: boolean) => void;
  audio: boolean;
  onAudioChange: (on: boolean) => void;
  className?: string;
}

/** "?" popover: keyboard map, shortcut toggle and sound toggle. */
export function ShortcutHelp({ open, onOpenChange, shortcuts, onShortcutsChange, audio, onAudioChange, className }: ShortcutHelpProps) {
  const id = useId();
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Shortcuts and sound"
          className={cn(
            'inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
        >
          <CircleHelp className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={`${id}-keys`} className="text-sm font-medium">
              Keyboard shortcuts
            </label>
            <Switch id={`${id}-keys`} checked={shortcuts} onCheckedChange={onShortcutsChange} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={`${id}-audio`} className="text-sm font-medium">
              Sound on each event
            </label>
            <Switch id={`${id}-audio`} checked={audio} onCheckedChange={onAudioChange} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Shortcuts work while the roast console has focus.</p>
          <dl className={cn('grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm', !shortcuts && 'opacity-50')}>
            {SHORTCUTS.map((s) => (
              <div key={s.keys} className="contents">
                <dt>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">{s.keys}</kbd>
                </dt>
                <dd className="text-muted-foreground">{s.action}</dd>
              </div>
            ))}
          </dl>
        </div>
      </PopoverContent>
    </Popover>
  );
}
