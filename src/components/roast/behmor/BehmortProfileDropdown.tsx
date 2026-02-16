/**
 * BehmortProfileDropdown Component
 * Dropdown selector for Behmor 2000AB built-in profiles (P1-P5, Manual)
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { BehmortProfile } from "@/types/roast-data.types";

interface BehmortProfileDropdownProps {
  selectedProfile: BehmortProfile;
  onProfileChange: (profile: BehmortProfile) => void;
  disabled?: boolean;
  variant?: 'default' | 'compact';
}

const PROFILE_INFO: Record<BehmortProfile, { duration: string; description: string }> = {
  'P1': { duration: '14:00', description: 'Light roast - shortest time' },
  'P2': { duration: '16:00', description: 'Light-medium roast' },
  'P3': { duration: '18:00', description: 'Medium roast - recommended' },
  'P4': { duration: '20:00', description: 'Medium-dark roast' },
  'P5': { duration: '22:00', description: 'Dark roast - longest time' },
  'Manual': { duration: 'Custom', description: 'Full manual control' }
};

export function BehmortProfileDropdown({
  selectedProfile,
  onProfileChange,
  disabled = false,
  variant = 'default'
}: BehmortProfileDropdownProps) {
  // Compact variant - inline badge-style
  if (variant === 'compact') {
    return (
      <Select
        value={selectedProfile}
        onValueChange={(value) => onProfileChange(value as BehmortProfile)}
        disabled={disabled}
      >
        <SelectTrigger className="w-auto h-auto px-3 py-1.5 text-sm border-muted-foreground/30">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(PROFILE_INFO) as BehmortProfile[]).map((profile) => (
            <SelectItem key={profile} value={profile}>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{profile}</span>
                <span className="text-xs text-muted-foreground">
                  {PROFILE_INFO[profile].duration}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  
  // Default variant - original full display
  return (
    <div className="space-y-3">
      <Label htmlFor="behmor-profile" className="text-sm font-medium">
        📋 Roast Profile
      </Label>
      <Select
        value={selectedProfile}
        onValueChange={(value) => onProfileChange(value as BehmortProfile)}
        disabled={disabled}
      >
        <SelectTrigger id="behmor-profile" className="w-full">
          <SelectValue placeholder="Select a profile" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(PROFILE_INFO) as BehmortProfile[]).map((profile) => (
            <SelectItem key={profile} value={profile}>
              <div className="flex flex-col items-start py-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{profile}</span>
                  <span className="text-xs text-muted-foreground">
                    {PROFILE_INFO[profile].duration}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {PROFILE_INFO[profile].description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedProfile === 'P3' && (
        <p className="text-xs text-green-600">
          ✓ P3 is recommended for most medium roasts
        </p>
      )}
      
      {selectedProfile === 'Manual' && (
        <p className="text-xs text-orange-500">
          ⚠ Manual mode requires close attention - not recommended for beginners
        </p>
      )}
    </div>
  );
}
