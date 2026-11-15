/**
 * RoastMonitor Container Component
 * Renders the mode for the selected roaster and opens the save dialog when a roast ends.
 */

import { lazy, Suspense, useCallback, useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useRoaster } from '@/contexts/RoasterContext';
import { useRoasterPreferences } from '@/hooks/useRoasterPreferences';
import { useToast } from '@/hooks/use-toast';
import { useMigration } from '@/hooks/useMigration';
import SaveRoastDialog from './SaveRoastDialog';
import { RoasterSwitcher } from './RoasterSwitcher';
import type { RoasterType } from '@/types/roaster.types';
import type { RoastModeProps, RoastSaveRequest } from './roast/modes/types';

// Lazy load mode components for performance
const MODES: Partial<Record<RoasterType, ComponentType<RoastModeProps>>> = {
  'gene-cbr-101': lazy(() => import('./roast/modes/GeneCBR101Mode').then(m => ({ default: m.GeneCBR101Mode }))),
  'behmor-2000ab': lazy(() => import('./roast/modes/BehmortMode').then(m => ({ default: m.BehmortMode }))),
  'freshroast-sr800': lazy(() => import('./roast/modes/FreshRoastMode').then(m => ({ default: m.FreshRoastMode }))),
  'kaldi-wide': lazy(() => import('./roast/modes/KaldiMode').then(m => ({ default: m.KaldiMode }))),
  'popcorn-popper': lazy(() => import('./roast/modes/PopcornPopperMode').then(m => ({ default: m.PopcornPopperMode }))),
  'hottop-kn8828': lazy(() => import('./roast/modes/HottopMode').then(m => ({ default: m.HottopMode }))),
};

const IMPLEMENTED_ROASTERS = Object.keys(MODES) as RoasterType[];
const FALLBACK_ROASTER: RoasterType = 'gene-cbr-101';

export default function RoastMonitor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentRoaster } = useRoaster();
  const { incrementUsage } = useRoasterPreferences(user?.id);

  useMigration();

  const [saveRequest, setSaveRequest] = useState<RoastSaveRequest | null>(null);
  const [roastInProgress, setRoastInProgress] = useState(false);

  const roasterType = MODES[currentRoaster] ? currentRoaster : FALLBACK_ROASTER;
  const ModeComponent = MODES[roasterType]!;

  const handleRoastSave = useCallback((request: RoastSaveRequest) => {
    setSaveRequest(request);
  }, []);

  const handleSaveSuccess = () => {
    saveRequest?.clear();
    setSaveRequest(null);
    if (user) incrementUsage(roasterType);
    toast({
      title: 'Roast Saved!',
      description: 'Your roast profile has been saved successfully.',
    });
    navigate('/dashboard');
  };

  return (
    <div className="bg-background p-2 sm:p-4 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
            Coffee Roast Monitor
          </h1>
          <div className="flex flex-col items-center gap-1">
            <RoasterSwitcher disabled={roastInProgress} roasters={IMPLEMENTED_ROASTERS} />
            {roastInProgress && (
              <p className="text-xs text-muted-foreground">Stop the current roast to switch roasters.</p>
            )}
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12" role="status">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" aria-hidden="true" />
                <p className="text-muted-foreground">Loading roaster mode...</p>
              </div>
            </div>
          }
        >
          <ModeComponent
            key={roasterType}
            onSave={handleRoastSave}
            onInProgressChange={setRoastInProgress}
          />
        </Suspense>

        {saveRequest && (
          <SaveRoastDialog
            isOpen
            onClose={() => setSaveRequest(null)}
            roastData={saveRequest.data}
            durationSeconds={saveRequest.durationSeconds}
            defaultInitialWeight={saveRequest.batchSize}
            onSaveSuccess={handleSaveSuccess}
            roasterType={roasterType}
            temperatureUnit={saveRequest.temperatureUnit}
          />
        )}
      </div>
    </div>
  );
}
