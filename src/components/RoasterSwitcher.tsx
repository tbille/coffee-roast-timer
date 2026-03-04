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
import { getRoasterSpec, ROASTER_SPECS } from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';

export function RoasterSwitcher() {
  const { user } = useAuth();
  const { currentRoaster, switchRoaster } = useRoaster();
  const { preferences } = useRoasterPreferences(user?.id);
  
  const currentSpec = getRoasterSpec(currentRoaster);
  
  // Get all roasters that have implemented modes
  const implementedRoasters: RoasterType[] = [
    'gene-cbr-101',
    'behmor-2000ab',
    'freshroast-sr800',
    'kaldi-wide',
    'popcorn-popper',
    'hottop-kn8828'
  ];
  
  // Show implemented roasters, prioritizing user's preferences
  const userRoasters = preferences?.map(p => p.roaster_type) || [];
  const availableRoasters: RoasterType[] = [
    ...new Set([...userRoasters, ...implementedRoasters])
  ].filter(r => implementedRoasters.includes(r));

  const getOptionLabel = (roasterType: RoasterType) => {
    const spec = getRoasterSpec(roasterType);
    const preference = preferences?.find(p => p.roaster_type === roasterType);

    if (preference?.is_primary) {
      return `${spec.name} (Primary)`;
    }

    return spec.name;
  };
  
  return (
    <Select value={currentRoaster} onValueChange={(value) => switchRoaster(value as RoasterType)}>
      <SelectTrigger className="w-[200px]">
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
