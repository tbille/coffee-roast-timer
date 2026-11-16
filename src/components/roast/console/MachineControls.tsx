/**
 * Live machine controls for the Roast state, configured from the registry vocabulary.
 * Steppers report through `onControl` (debounced by the console); discrete panel
 * presses (Behmor +, P1-P5, D; Hottop mode) go through `onPress` (logged at once).
 */
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatClock, type TempUnit } from '@/lib/format';
import {
  BEHMOR_MANUAL_POWER,
  BEHMOR_PLUS_SECONDS,
  BEHMOR_PROGRAMS,
  ROASTER_SPECS,
} from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';
import { ControlStepper } from './ControlStepper';
import { COLOUR_CUES, type ConsoleLog, type StartingSettings } from './model';
import { PressButton } from './PressButton';

const panelButton =
  'inline-flex h-12 min-w-12 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 font-mono text-base font-medium tabular-nums text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

export interface MachineControlsProps {
  roasterType: RoasterType;
  log: ConsoleLog;
  /** Current value of every control, pending (not yet logged) values included */
  values: StartingSettings;
  unit: TempUnit;
  elapsedS: number;
  disabled?: boolean;
  onControl: (control: string, value: number) => void;
  onPress: (control: string, value: number | string) => void;
  onColourCue: (color: string) => void;
}

export function MachineControls(props: MachineControlsProps) {
  const { roasterType } = props;
  if (roasterType === 'behmor-2000ab') return <BehmorControls {...props} />;
  if (roasterType === 'popcorn-popper') return <PopperCues {...props} />;
  return <StepperControls {...props} />;
}

function StepperControls({ roasterType, values, unit, disabled, onControl, onPress }: MachineControlsProps) {
  const spec = ROASTER_SPECS[roasterType];
  const controls = spec.controls ?? [];
  const hottopAuto = roasterType === 'hottop-kn8828' && values.mode !== 'manual';

  if (hottopAuto) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
        <p className="text-sm text-foreground">
          Auto mode <span className="text-muted-foreground">· the machine sets heat and fan</span>
        </p>
        <PressButton className={panelButton} onPress={() => onPress('mode', 'manual')} disabled={disabled}>
          Switch to manual
        </PressButton>
      </div>
    );
  }
  if (controls.length === 0) return null;

  return (
    <div className={cn('grid gap-4', controls.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-xs')}>
      {controls.map((control) => (
        <ControlStepper
          key={control.id}
          spec={control}
          unit={unit}
          value={typeof values[control.id] === 'number' ? (values[control.id] as number) : control.default}
          onChange={(v) => onControl(control.id, v)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function BehmorControls({ log, values, elapsedS, disabled, onPress }: MachineControlsProps) {
  const [manualOpen, setManualOpen] = useState(() => log.controlChanges.some((c) => c.control === 'manual'));
  const lcdStart = typeof log.startingSettings.lcd === 'number' ? log.startingSettings.lcd : 0;
  const added = log.controlChanges
    .filter((c) => c.control === 'extend')
    .reduce((sum, c) => sum + (typeof c.value === 'number' ? c.value : 0), 0);
  const remaining = lcdStart + added - elapsedS;
  const manual = typeof values.manual === 'string' ? values.manual : undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Behmor display</p>
          <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
            {remaining >= 0 ? formatClock(remaining) : `-${formatClock(-remaining)}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {String(log.startingSettings.weight ?? '')} · {String(log.startingSettings.program ?? 'P1')}
            {added > 0 && ` · +${formatClock(added)} added`}
            {manual && ` · manual ${manual}`}
          </p>
        </div>
        <PressButton className={panelButton} onPress={() => onPress('extend', BEHMOR_PLUS_SECONDS)} disabled={disabled}>
          <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {BEHMOR_PLUS_SECONDS} s
        </PressButton>
        <button
          type="button"
          className={cn(panelButton, 'font-sans')}
          aria-expanded={manualOpen}
          onClick={() => setManualOpen((o) => !o)}
        >
          Manual
        </button>
      </div>
      {manualOpen && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Log each button you press: P1-P5 set element power, D changes drum speed.
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Manual mode buttons">
            {BEHMOR_PROGRAMS.map((p) => (
              <PressButton
                key={p}
                className={cn(panelButton, manual === p && 'border-primary bg-primary text-primary-foreground hover:bg-primary')}
                onPress={() => onPress('manual', p)}
                disabled={disabled}
                aria-label={`${p}, ${BEHMOR_MANUAL_POWER[p]}% power`}
                aria-pressed={manual === p}
              >
                {p}
              </PressButton>
            ))}
            <PressButton className={panelButton} onPress={() => onPress('drum', 'D')} disabled={disabled} aria-label="D, drum speed">
              D
            </PressButton>
          </div>
        </div>
      )}
    </div>
  );
}

function PopperCues({ disabled, onColourCue }: MachineControlsProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bean colour (optional)</p>
      <div className="flex flex-wrap gap-2">
        {COLOUR_CUES.map((c) => (
          <PressButton
            key={c.value}
            className="inline-flex h-12 items-center rounded-full border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            onPress={() => onColourCue(c.value)}
            disabled={disabled}
          >
            {c.label}
          </PressButton>
        ))}
      </div>
    </div>
  );
}
