import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Coffee } from 'lucide-react';
import { ROASTER_SPECS } from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';
import { saveRoasterPreference, getRoasterPreference } from '@/utils/roasterPreferences';

export function RoasterSelectorCTA() {
  const navigate = useNavigate();
  const [selectedRoaster, setSelectedRoaster] = useState<RoasterType | ''>('');

  // Load saved preference on mount
  useEffect(() => {
    const savedRoaster = getRoasterPreference();
    if (savedRoaster) {
      setSelectedRoaster(savedRoaster);
    }
  }, []);

  const handleStartRoasting = () => {
    if (selectedRoaster) {
      saveRoasterPreference(selectedRoaster);
      navigate('/roast', { state: { roasterType: selectedRoaster } });
    }
  };

  const handleBrowseProfiles = () => {
    navigate('/discover');
  };

  // Only show these 6 supported roasters on the homepage
  const supportedRoasterIds: RoasterType[] = [
    'popcorn-popper',
    'gene-cbr-101',
    'behmor-2000ab',
    'freshroast-sr800',
    'kaldi-wide',
    'hottop-kn8828'
  ];

  // Filter and get roasters in the specified order
  const sortedRoasters = supportedRoasterIds
    .map(id => ROASTER_SPECS[id])
    .filter(Boolean); // Filter out any undefined specs

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Roaster Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground block text-center">
          Select Your Roaster to Start
        </label>
        <Select
          value={selectedRoaster}
          onValueChange={(value) => setSelectedRoaster(value as RoasterType)}
        >
          <SelectTrigger className="w-full h-16 text-lg">
            <SelectValue placeholder="Choose your coffee roaster..." />
          </SelectTrigger>
          <SelectContent>
            {sortedRoasters.map((roaster) => (
              <SelectItem key={roaster.id} value={roaster.id} className="py-4 text-base min-h-[56px]">
                <div className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 opacity-60" />
                  <span className="font-medium">{roaster.displayName}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="flex-1 h-20 text-xl font-semibold"
          onClick={handleStartRoasting}
          disabled={!selectedRoaster}
        >
          Start Roasting
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1 h-20 text-xl"
          onClick={handleBrowseProfiles}
        >
          Browse Profiles
        </Button>
      </div>

      {/* Helper Text */}
      {selectedRoaster && (
        <p className="text-sm text-center text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
          Ready to roast with {sortedRoasters.find(r => r.id === selectedRoaster)?.displayName}
        </p>
      )}
    </div>
  );
}
