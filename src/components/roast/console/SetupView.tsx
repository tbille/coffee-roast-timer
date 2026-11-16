/**
 * Setup (status idle): machine, batch, starting settings, unit, optional reference,
 * first-run prep lines, and the Charge button.
 */
import { useId, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, Flame, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { ChipGroup } from '@/components/ui/chip-group';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StatStrip } from '@/components/roast-card/StatStrip';
import { RoasterSwitcher } from '@/components/RoasterSwitcher';
import { cn } from '@/lib/utils';
import { formatClock, formatDate, parseClock, parseLocaleNumber, type TempUnit } from '@/lib/format';
import {
  BEHMOR_PROGRAMS,
  BEHMOR_WEIGHTS,
  HOTTOP_MODES,
  ROASTER_SPECS,
  type BehmorWeight,
} from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';
import type { RoastReference } from '@/types/roast-session.types';
import { ControlStepper } from './ControlStepper';
import type { StartingSettings } from './model';

const card = 'space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5';
const cardTitle = 'text-base font-semibold text-foreground';

const PREP_LINES = [
  'Roast under a hood, by an open window or outdoors: roasting makes smoke.',
  'Never leave the roaster unattended while it is on.',
  'Have a metal colander or cooling tray ready before you charge.',
];

const POPPER_MAX_GRAMS = 100;

export interface SetupViewProps {
  roasterType: RoasterType;
  onRoasterChange: (type: RoasterType) => void;
  batchGrams: number;
  onBatchChange: (grams: number) => void;
  starting: StartingSettings;
  onStartingChange: (patch: StartingSettings) => void;
  unit: TempUnit;
  onUnitChange: (unit: TempUnit) => void;
  audio: boolean;
  onAudioChange: (on: boolean) => void;
  reference: RoastReference | null;
  referenceLoading: boolean;
  referenceError: string | null;
  onClearReference: () => void;
  onUseReferenceSettings?: () => void;
  showPrep: boolean;
  onDismissPrep: () => void;
  onCharge: () => void;
}

export function SetupView(props: SetupViewProps) {
  const {
    roasterType,
    onRoasterChange,
    batchGrams,
    onBatchChange,
    starting,
    onStartingChange,
    unit,
    onUnitChange,
    audio,
    onAudioChange,
    reference,
    referenceLoading,
    referenceError,
    onClearReference,
    onUseReferenceSettings,
    showPrep,
    onDismissPrep,
    onCharge,
  } = props;
  const spec = ROASTER_SPECS[roasterType];
  const id = useId();
  const [batchText, setBatchText] = useState(() => String(batchGrams));
  // Follow outside changes (machine switch, "Use its batch") without fighting the user's typing.
  const [batchSeen, setBatchSeen] = useState(batchGrams);
  if (batchSeen !== batchGrams) {
    setBatchSeen(batchGrams);
    setBatchText(String(batchGrams));
  }

  const parsedBatch = parseLocaleNumber(batchText);
  const isPopper = roasterType === 'popcorn-popper';
  const overMax = parsedBatch !== undefined && parsedBatch > spec.maxBatchSize;
  const blockedReason =
    parsedBatch === undefined || parsedBatch <= 0
      ? 'Enter your batch weight to charge.'
      : isPopper && parsedBatch > POPPER_MAX_GRAMS
        ? `More than ${POPPER_MAX_GRAMS} g can overheat a popcorn popper. Reduce the batch to charge.`
        : undefined;

  const onBatchText = (text: string) => {
    setBatchText(text);
    const n = parseLocaleNumber(text);
    if (n !== undefined && n > 0) {
      const grams = Math.round(n * 10) / 10;
      setBatchSeen(grams);
      onBatchChange(grams);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <PageHeader title="Roast" description="Pick your machine, weigh your beans, charge." />

      <div className="space-y-4">
        {showPrep && (
          <section className={cn(card, 'relative')} aria-labelledby={`${id}-prep`}>
            <h2 id={`${id}-prep`} className={cardTitle}>
              Before your first roast
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
              {PREP_LINES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onDismissPrep}
              className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Dismiss preparation tips"
            >
              <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </button>
          </section>
        )}

        {isPopper && (
          <section className={cn(card, 'border-warning')} aria-labelledby={`${id}-safety`}>
            <h2 id={`${id}-safety`} className={cardTitle}>
              Popcorn popper safety
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
              {spec.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <Link to="/how-to/popcorn-popper-safety" className="text-sm font-medium text-foreground underline underline-offset-4">
              Read the popcorn popper safety guide
            </Link>
          </section>
        )}

        <section className={card} aria-labelledby={`${id}-machine`}>
          <h2 id={`${id}-machine`} className={cardTitle}>
            Machine
          </h2>
          <RoasterSwitcher value={roasterType} onChange={onRoasterChange} />
        </section>

        <section className={card} aria-labelledby={`${id}-batch`}>
          <h2 id={`${id}-batch`} className={cardTitle}>
            Batch
          </h2>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-grams`} className="text-sm font-medium text-foreground">
              Green beans in (g)
            </label>
            <div className="flex max-w-xs items-center gap-2">
              <input
                id={`${id}-grams`}
                inputMode="decimal"
                autoComplete="off"
                value={batchText}
                onChange={(e) => onBatchText(e.target.value)}
                aria-describedby={`${id}-grams-hint`}
                aria-invalid={!!blockedReason || undefined}
                className="h-12 w-32 rounded-md border border-input bg-background px-3 font-mono text-lg tabular-nums text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
              />
              <span className="text-sm text-muted-foreground">g</span>
            </div>
            <p id={`${id}-grams-hint`} className={cn('text-sm', overMax ? 'text-warning' : 'text-muted-foreground')}>
              {overMax
                ? `Above the ${spec.maxBatchSize} g this machine is made for.`
                : `Within ${spec.minBatchSize}–${spec.maxBatchSize} g on the ${spec.name}.`}
            </p>
          </div>
        </section>

        <StartingSettingsCard
          roasterType={roasterType}
          starting={starting}
          onChange={onStartingChange}
          unit={unit}
          titleId={`${id}-start`}
        />

        <section className={card} aria-labelledby={`${id}-ref`}>
          <h2 id={`${id}-ref`} className={cardTitle}>
            Reference
          </h2>
          {referenceLoading ? (
            <p className="text-sm text-muted-foreground" role="status">
              Loading the roast to follow...
            </p>
          ) : reference ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-sm text-foreground">
                  Following: <span className="font-semibold">{reference.name}</span>
                  {reference.roastedAt && <span className="text-muted-foreground"> · {formatDate(reference.roastedAt)}</span>}
                </p>
                <button
                  type="button"
                  onClick={onClearReference}
                  className="h-10 shrink-0 rounded-md px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Clear
                </button>
              </div>
              <StatStrip
                size="sm"
                columns={3}
                stats={[
                  { label: 'Yellow', value: reference.yellowingS ? formatClock(reference.yellowingS) : null },
                  { label: '1st crack', value: reference.firstCrackS ? formatClock(reference.firstCrackS) : null },
                  { label: 'Drop', value: reference.dropS ? formatClock(reference.dropS) : null },
                ]}
              />
              {reference.roasterType && reference.roasterType !== roasterType && (
                <p className="text-sm text-muted-foreground">
                  Roasted on a {ROASTER_SPECS[reference.roasterType as RoasterType]?.name ?? 'different machine'}. Times still
                  show as a guide.
                </p>
              )}
              {onUseReferenceSettings && (
                <button
                  type="button"
                  onClick={onUseReferenceSettings}
                  className="h-10 rounded-md border border-input px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Use its batch and starting settings
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {referenceError && <p className="text-sm text-muted-foreground">{referenceError}</p>}
              <Link to="/roasts" className="text-sm font-medium text-foreground underline underline-offset-4">
                Roast again from a saved roast
              </Link>
            </div>
          )}
        </section>

        <section className={card} aria-labelledby={`${id}-prefs`}>
          <h2 id={`${id}-prefs`} className="sr-only">
            Preferences
          </h2>
          <ChipGroup<TempUnit>
            label="Temperature unit"
            options={[
              { value: 'C', label: '°C' },
              { value: 'F', label: '°F' },
            ]}
            value={unit}
            onChange={(v) => v && onUnitChange(v)}
          />
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={`${id}-audio`} className="text-sm font-medium text-foreground">
              Sound on each event
            </label>
            <Switch id={`${id}-audio`} checked={audio} onCheckedChange={onAudioChange} />
          </div>
        </section>

        {/* Phones: sticky above the tab bar so Charge is always in reach. From md up: inline. */}
        <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 -mx-4 space-y-1.5 border-t border-border bg-background px-4 py-3 sm:-mx-6 sm:px-6 md:static md:mx-0 md:space-y-2 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-2">
          <button
            type="button"
            onClick={onCharge}
            disabled={!!blockedReason}
            aria-describedby={blockedReason ? `${id}-blocked` : undefined}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 text-lg font-semibold text-accent-foreground transition-opacity duration-150 hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 md:h-14"
          >
            <Flame className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            Charge — start timer
          </button>
          {blockedReason ? (
            <p id={`${id}-blocked`} className="text-sm text-destructive">
              {blockedReason}
            </p>
          ) : (
            <p className="text-center text-xs text-muted-foreground md:text-left md:text-sm">
              Press when the beans go in.<span className="hidden md:inline"> That moment is 0:00.</span>
            </p>
          )}
        </div>

        <Collapsible className="rounded-lg border border-border">
          <CollapsibleTrigger className="group flex h-12 w-full items-center justify-between px-4 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring">
            Tips for the {spec.name}
            <ChevronDown className="h-4 w-4 transition-transform duration-150 group-data-[state=open]:rotate-180" strokeWidth={1.75} aria-hidden />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 px-4 pb-4">
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
              {spec.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            {spec.guidePath && (
              <Link to={spec.guidePath} className="inline-block text-sm font-medium text-foreground underline underline-offset-4">
                Read the {spec.name} guide
              </Link>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

function StartingSettingsCard({
  roasterType,
  starting,
  onChange,
  unit,
  titleId,
}: {
  roasterType: RoasterType;
  starting: StartingSettings;
  onChange: (patch: StartingSettings) => void;
  unit: TempUnit;
  titleId: string;
}) {
  const spec = ROASTER_SPECS[roasterType];
  const controls = spec.controls ?? [];
  const isBehmor = roasterType === 'behmor-2000ab';
  const isHottop = roasterType === 'hottop-kn8828';
  if (!isBehmor && controls.length === 0) return null;
  const hottopAuto = isHottop && starting.mode === 'auto';

  return (
    <section className={card} aria-labelledby={titleId}>
      <h2 id={titleId} className={cardTitle}>
        Starting settings
      </h2>
      {isBehmor && <BehmorSetup starting={starting} onChange={onChange} />}
      {isHottop && (
        <ChipGroup
          label="Mode"
          options={HOTTOP_MODES.map((m) => ({ value: m.id, label: m.label }))}
          value={String(starting.mode ?? 'manual')}
          onChange={(v) => v && onChange({ mode: v })}
        />
      )}
      {hottopAuto ? (
        <p className="text-sm text-muted-foreground">
          In auto the machine sets heat and fan. You can switch to manual during the roast.
        </p>
      ) : (
        controls.length > 0 && (
          <div className={cn('grid gap-4', controls.length > 1 ? 'grid-cols-2' : 'max-w-xs grid-cols-1')}>
            {controls.map((control) => (
              <ControlStepper
                key={control.id}
                spec={control}
                unit={unit}
                value={typeof starting[control.id] === 'number' ? (starting[control.id] as number) : control.default}
                onChange={(v) => onChange({ [control.id]: v })}
              />
            ))}
          </div>
        )
      )}
    </section>
  );
}

function BehmorSetup({ starting, onChange }: { starting: StartingSettings; onChange: (patch: StartingSettings) => void }) {
  const id = useId();
  const lcd = typeof starting.lcd === 'number' ? starting.lcd : 12 * 60;
  const [lcdText, setLcdText] = useState(formatClock(lcd));
  const [lcdSeen, setLcdSeen] = useState(lcd);
  if (lcdSeen !== lcd) {
    setLcdSeen(lcd);
    setLcdText(formatClock(lcd));
  }
  const lcdInvalid = parseClock(lcdText) === undefined;

  return (
    <div className="space-y-4">
      <ChipGroup<BehmorWeight>
        label="Weight button"
        options={BEHMOR_WEIGHTS.map((w) => ({ value: w.id, label: w.label }))}
        value={(starting.weight as BehmorWeight) ?? '1/2 lb'}
        onChange={(v) => {
          if (!v) return;
          const weight = BEHMOR_WEIGHTS.find((w) => w.id === v);
          onChange({ weight: v, ...(weight ? { lcd: weight.defaultLcdS } : {}) });
        }}
      />
      <ChipGroup
        label="Program"
        options={BEHMOR_PROGRAMS.map((p) => ({ value: p, label: p }))}
        value={String(starting.program ?? 'P1')}
        onChange={(v) => v && onChange({ program: v })}
      />
      <div className="space-y-1.5">
        <label htmlFor={`${id}-lcd`} className="text-sm font-medium text-foreground">
          Time on the display at start (m:ss)
        </label>
        <input
          id={`${id}-lcd`}
          inputMode="numeric"
          autoComplete="off"
          value={lcdText}
          onChange={(e) => {
            setLcdText(e.target.value);
            const s = parseClock(e.target.value);
            if (s !== undefined && s > 0) {
              setLcdSeen(s);
              onChange({ lcd: s });
            }
          }}
          aria-invalid={lcdInvalid || undefined}
          aria-describedby={`${id}-lcd-hint`}
          className="h-12 w-32 rounded-md border border-input bg-background px-3 font-mono text-lg tabular-nums text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
        />
        <p id={`${id}-lcd-hint`} className="text-sm text-muted-foreground">
          Prefilled with the manual's default for the weight button. Copy what your Behmor shows.
        </p>
      </div>
    </div>
  );
}
