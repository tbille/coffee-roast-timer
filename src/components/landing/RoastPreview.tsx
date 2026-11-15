import { Flame } from 'lucide-react';

/**
 * Static illustration of a roast in progress, so first-time visitors can see
 * what the timer tracks before picking a roaster.
 */
const PHASES = [
  { label: 'Drying', width: '41%', className: 'bg-amber-300 dark:bg-amber-600' },
  { label: 'Maillard', width: '40%', className: 'bg-orange-400 dark:bg-orange-600' },
  { label: 'Development', width: '19%', className: 'bg-amber-800 dark:bg-amber-900' },
];

const STATS = [
  { label: 'First crack', value: '09:30' },
  { label: 'Development', value: '19%' },
  { label: 'Weight loss', value: '14.2%' },
];

export function RoastPreview() {
  return (
    <figure className="w-full max-w-md mx-auto rounded-xl border bg-card text-card-foreground shadow-lg p-5 sm:p-6">
      <div aria-hidden="true">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium">Gene Cafe CBR-101</span>
          <span className="flex items-center gap-1 text-primary font-medium">
            <Flame className="h-4 w-4" />
            Development
          </span>
        </div>

        <p className="mt-3 text-5xl sm:text-6xl font-bold tabular-nums tracking-tight">11:42</p>

        <div className="mt-5">
          <div className="relative flex h-3 rounded-full overflow-hidden">
            {PHASES.map((phase) => (
              <div key={phase.label} className={phase.className} style={{ width: phase.width }} />
            ))}
          </div>
          <div className="mt-2 flex text-[11px] sm:text-xs text-muted-foreground">
            {PHASES.map((phase) => (
              <span key={phase.label} style={{ width: phase.width }} className="truncate">
                {phase.label}
              </span>
            ))}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t pt-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <figcaption className="sr-only">
        Example roast on a Gene Cafe: 11:42 elapsed, first crack at 09:30, 19% development
        time, 14.2% weight loss.
      </figcaption>
    </figure>
  );
}
