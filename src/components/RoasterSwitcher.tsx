/**
 * RoasterSwitcher Component
 * Dropdown in header to switch between user's roasters
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoaster } from '@/contexts/RoasterContext';
import { useRoasterPreferences } from '@/hooks/useRoasterPreferences';
import { useAuth } from '@/hooks/useAuth';
import { getRoasterSpec } from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';

interface RoasterSwitcherProps {
  /** Roasters that have a mode implemented */
  roasters: RoasterType[];
  disabled?: boolean;
}

export function RoasterSwitcher({ roasters, disabled = false }: RoasterSwitcherProps) {
  const { user } = useAuth();
  const { currentRoaster, switchRoaster } = useRoaster();
  const { preferences } = useRoasterPreferences(user?.id);

  const currentSpec = getRoasterSpec(currentRoaster);

  // Show implemented roasters, user's preferred ones first
  const userRoasters = preferences?.map(p => p.roaster_type) || [];
  const availableRoasters: RoasterType[] = [
    ...new Set([...userRoasters, ...roasters])
  ].filter(r => roasters.includes(r));

  const getOptionLabel = (roasterType: RoasterType) => {
    const spec = getRoasterSpec(roasterType);
    const preference = preferences?.find(p => p.roaster_type === roasterType);

    if (preference?.is_primary) {
      return `${spec.name} (Primary)`;
    }

    return spec.name;
  };
  
  return (
    <Select value={currentRoaster} onValueChange={(value) => switchRoaster(value as RoasterType)} disabled={disabled}>
      <SelectTrigger className="w-[200px]" aria-label="Roaster">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="truncate">{currentSpec.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableRoasters.map(roasterType => {
          return (
            <SelectItem key={roasterType} value={roasterType}>
              {getOptionLabel(roasterType)}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
