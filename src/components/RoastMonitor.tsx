/**
 * RoastMonitor Container Component
 * Routes to appropriate roaster mode based on user selection
 * Refactored from monolithic component to container pattern
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRoaster } from '@/contexts/RoasterContext';
import { useRoasterPreferences } from '@/hooks/useRoasterPreferences';
import { useToast } from '@/hooks/use-toast';
import SaveRoastDialog from './SaveRoastDialog';
import { RoasterSwitcher } from './RoasterSwitcher';
import { useMigration } from '@/hooks/useMigration';
import type { DualTempRoastData } from '@/types/roast-data.types';
import type { RoasterType } from '@/types/roaster.types';
import { getRoasterSpec } from '@/utils/roasterRegistry';
import { convertTemperature, type TemperatureUnit } from '@/utils/temperatureConversion';

// Lazy load mode components for performance
const GeneCBR101Mode = lazy(() => import('./roast/modes/GeneCBR101Mode').then(m => ({ default: m.GeneCBR101Mode })));
const BehmortMode = lazy(() => import('./roast/modes/BehmortMode').then(m => ({ default: m.BehmortMode })));
const FreshRoastMode = lazy(() => import('./roast/modes/FreshRoastMode').then(m => ({ default: m.FreshRoastMode })));
const KaldiMode = lazy(() => import('./roast/modes/KaldiMode').then(m => ({ default: m.KaldiMode })));
const PopcornPopperMode = lazy(() => import('./roast/modes/PopcornPopperMode').then(m => ({ default: m.PopcornPopperMode })));
const HottopMode = lazy(() => import('./roast/modes/HottopMode').then(m => ({ default: m.HottopMode })));

interface RoastMonitorProps {
  onBack?: () => void;
}

export default function RoastMonitor({ onBack }: RoastMonitorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentRoaster } = useRoaster();
  const { incrementUsage } = useRoasterPreferences(user?.id);
  
  // Run migration if needed
  useMigration();
  
  // Save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [roastDataToSave, setRoastDataToSave] = useState<any>(null);
  
  // User temperature preference
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('C');
  
  // Force remount key when roaster changes
  const [mountKey, setMountKey] = useState(0);
  
  // Reset mount key when roaster changes
  useEffect(() => {
    setMountKey(prev => prev + 1);
  }, [currentRoaster]);
  
  const renderKey = `${currentRoaster}-${mountKey}`;
  
  /**
   * Handle roast completion from any mode
   * Opens save dialog and increments usage count
   */
  const handleRoastSave = (roastData: any) => {
    setRoastDataToSave(roastData);
    setShowSaveDialog(true);
    
    // Increment usage count for this roaster
    if (user) {
      incrementUsage(currentRoaster);
    }
  };
  
  /**
   * Handle successful save from dialog
   */
  const handleSaveSuccess = () => {
    setShowSaveDialog(false);
    setRoastDataToSave(null);
    
    toast({
      title: 'Roast Saved!',
      description: 'Your roast profile has been saved successfully.',
    });
    
    // Navigate to dashboard
    navigate('/dashboard');
  };
  
  /**
   * Get roaster spec for display
   */
  const roasterSpec = getRoasterSpec(currentRoaster);
  
  /**
   * Render the appropriate mode component based on current roaster
   */
  const renderModeComponent = () => {
    switch (currentRoaster) {
      case 'gene-cbr-101':
        return (
          <GeneCBR101Mode
            onSave={handleRoastSave}
            initialBatchSize={225}
            temperatureUnit={temperatureUnit}
            onTemperatureUnitChange={setTemperatureUnit}
          />
        );
      
      case 'behmor-2000ab':
        return (
          <BehmortMode
            onSave={handleRoastSave}
            initialBatchSize={340}
          />
        );
      
      case 'freshroast-sr800':
        return (
          <FreshRoastMode
            onSave={handleRoastSave}
            initialBatchSize={120}
          />
        );
      
      case 'kaldi-wide':
        return (
          <KaldiMode
            onSave={handleRoastSave}
            initialBatchSize={250}
          />
        );
      
      case 'popcorn-popper':
        return (
          <PopcornPopperMode
            onSave={handleRoastSave}
            initialBatchSize={75}
          />
        );
      
      case 'hottop-kn8828':
        return (
          <HottopMode
            onSave={handleRoastSave}
            initialBatchSize={250}
          />
        );
      
      default:
        // Fallback to Gene mode for unsupported roasters
        console.warn(`Unsupported roaster type: ${currentRoaster}, falling back to Gene CBR-101 mode`);
        return (
          <GeneCBR101Mode
            onSave={handleRoastSave}
            initialBatchSize={225}
            temperatureUnit={temperatureUnit}
            onTemperatureUnitChange={setTemperatureUnit}
          />
        );
    }
  };
  
  return (
    <div className="bg-background p-2 sm:p-4 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Header with Roaster Switcher */}
        <div className="mb-4 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
            Coffee Roast Monitor
          </h1>
          <div className="flex justify-center">
            <RoasterSwitcher />
          </div>
        </div>
        
        {/* Mode Component (Lazy Loaded) */}
        <div key={renderKey}>
          <Suspense 
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Loading roaster mode...</p>
                </div>
              </div>
            }
          >
            {renderModeComponent()}
          </Suspense>
        </div>
        
        {/* Save Dialog */}
        {showSaveDialog && roastDataToSave && (
          <SaveRoastDialog
            isOpen={showSaveDialog}
            onClose={() => setShowSaveDialog(false)}
            roastData={roastDataToSave}
            onSaveSuccess={handleSaveSuccess}
            roasterType={currentRoaster}
            temperatureUnit={temperatureUnit}
          />
        )}
      </div>
    </div>
  );
}
