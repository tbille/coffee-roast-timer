/**
 * RoasterTips Component
 * Displays contextual tips based on roaster type and roast state
 */

import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { getRoasterSpec } from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';

interface RoasterTipsProps {
  roasterType: RoasterType;
  elapsedSeconds: number;
  firstCrackRecorded: boolean;
  profile?: string; // For Behmor: P1, P2, etc.
  extensions?: number; // For Behmor: number of extensions added
  defaultCollapsed?: boolean; // Whether tips should be collapsed by default
}

export function RoasterTips({
  roasterType,
  elapsedSeconds,
  firstCrackRecorded,
  profile,
  extensions,
  defaultCollapsed = false
}: RoasterTipsProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const spec = getRoasterSpec(roasterType);
  
  /**
   * Get contextual tips based on current roast state
   */
  const getContextualTips = (): string[] => {
    const tips: string[] = [];
    const minutesElapsed = Math.floor(elapsedSeconds / 60);
    
    // Gene CBR-101 specific tips
    if (roasterType === 'gene-cbr-101') {
      if (minutesElapsed < 3) {
        tips.push('Initial phase: Beans are drying and turning yellow');
      } else if (minutesElapsed < 8 && !firstCrackRecorded) {
        tips.push('Approaching first crack - listen for popping sounds');
      } else if (firstCrackRecorded && elapsedSeconds - (firstCrackRecorded ? elapsedSeconds : 0) < 120) {
        tips.push('Development phase: Adjust target temp to control roast level');
      }
    }
    
    // Behmor specific tips
    if (roasterType === 'behmor-2000ab') {
      if (profile === 'P3') {
        tips.push('P3 is ideal for medium roasts - great starting point');
      }
      if (!firstCrackRecorded && minutesElapsed > 5) {
        tips.push('First crack typically at 12-15 minutes remaining');
      }
      if (firstCrackRecorded && (extensions || 0) === 0) {
        tips.push('Consider adding 1-2 extensions after first crack for medium roast');
      }
      if ((extensions || 0) >= 4) {
        tips.push('⚠ Many extensions - roast may be getting dark');
      }
    }
    
    // Add general tips from spec
    if (tips.length < 2 && spec.tips.length > 0) {
      // Add a random general tip
      const randomTip = spec.tips[Math.floor(Math.random() * spec.tips.length)];
      tips.push(randomTip);
    }
    
    return tips;
  };
  
  const contextualTips = getContextualTips();
  const hasWarnings = spec.warnings && spec.warnings.length > 0;
  
  // Don't render if no tips available
  if (contextualTips.length === 0 && !hasWarnings) {
    return null;
  }
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">
              Tips for {spec.displayName}
            </span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {/* Contextual Tips */}
            {contextualTips.length > 0 && (
              <div className="space-y-2">
                {contextualTips.map((tip, index) => (
                  <div key={index} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Warnings */}
            {hasWarnings && (
              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs font-semibold text-orange-600">
                  ⚠ Important Reminders:
                </div>
                {spec.warnings.map((warning, index) => (
                  <div key={index} className="flex gap-2 text-xs text-muted-foreground">
                    <span>•</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
