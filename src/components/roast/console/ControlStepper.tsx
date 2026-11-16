import { Stepper } from '@/components/ui/stepper';
import type { TempUnit } from '@/lib/format';
import type { RoasterControlSpec } from '@/types/roaster.types';

const cToF = (c: number) => (c * 9) / 5 + 32;
const fToC = (f: number) => Math.round((((f - 32) * 5) / 9) * 10) / 10;
const snap = (v: number, step: number) => Math.round(v / step) * step;

export interface ControlStepperProps {
  spec: RoasterControlSpec;
  /** Stored value (°C for temperature controls) */
  value: number;
  onChange: (value: number) => void;
  unit: TempUnit;
  size?: 'md' | 'lg';
  disabled?: boolean;
  hint?: string;
  className?: string;
}

/**
 * A machine control in its own vocabulary. Temperature controls step in the
 * viewer's unit (5 °F steps for °F users) and always report °C.
 */
export function ControlStepper({ spec, value, onChange, unit, size = 'md', disabled, hint, className }: ControlStepperProps) {
  const isTemp = spec.unit === '°C';
  const inF = isTemp && unit === 'F';
  const shown = inF ? snap(cToF(value), spec.step) : value;
  const min = inF ? snap(cToF(spec.min), spec.step) : spec.min;
  const max = inF ? snap(cToF(spec.max), spec.step) : spec.max;
  const suffix = isTemp ? ` °${unit}` : spec.unit === '%' ? '%' : '';

  return (
    <Stepper
      label={spec.label}
      value={shown}
      min={min}
      max={max}
      step={spec.step}
      size={size}
      disabled={disabled}
      hint={hint}
      className={className}
      format={(v) => `${v}${suffix}`}
      valueText={(v) =>
        isTemp ? `${v} degrees ${unit === 'F' ? 'Fahrenheit' : 'Celsius'}` : spec.unit === '%' ? `${v} percent` : `${v} of ${spec.max}`
      }
      onChange={(v) => onChange(inF ? fToC(v) : v)}
    />
  );
}
