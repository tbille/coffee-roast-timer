/**
 * RoasterSwitcher — machine select for the roast console Setup.
 * Lists implemented machines only, the user's own roasters first.
 */
import { useId } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoasterPreferences } from '@/hooks/useRoasterPreferences';
import { useAuth } from '@/hooks/useAuth';
import { IMPLEMENTED_ROASTERS, ROASTER_SPECS } from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';

interface RoasterSwitcherProps {
  value: RoasterType;
  onChange: (type: RoasterType) => void;
  disabled?: boolean;
  label?: string;
}

export function RoasterSwitcher({ value, onChange, disabled = false, label = 'Roaster' }: RoasterSwitcherProps) {
  const id = useId();
  const { user } = useAuth();
  const { preferences } = useRoasterPreferences(user?.id);

  const owned = (preferences ?? []).map((p) => p.roaster_type).filter((t) => IMPLEMENTED_ROASTERS.includes(t));
  const options: RoasterType[] = [...new Set([...owned, ...IMPLEMENTED_ROASTERS])];
  const primary = preferences?.find((p) => p.is_primary)?.roaster_type;

  return (
    <div className="space-y-1.5">
      <label id={`${id}-label`} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as RoasterType)} disabled={disabled}>
        <SelectTrigger className="h-12 w-full max-w-sm text-base" aria-labelledby={`${id}-label`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((type) => (
            <SelectItem key={type} value={type}>
              {ROASTER_SPECS[type].displayName}
              {type === primary ? ' (your main roaster)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
