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
          const spec = getRoasterSpec(roasterType);
          const preference = preferences?.find(p => p.roaster_type === roasterType);
          
          return (
            <SelectItem key={roasterType} value={roasterType}>
              <div className="flex flex-col items-start py-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{spec.name}</span>
                  {preference?.is_primary && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
                {preference && (
                  <span className="text-xs text-muted-foreground">
                    {preference.usage_count} roast{preference.usage_count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
