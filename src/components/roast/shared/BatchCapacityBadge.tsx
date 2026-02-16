/**
 * BatchCapacityBadge Component
 * Compact badge display for batch capacity in header
 */

import { cn } from '@/lib/utils';
import { getRoasterSpec } from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';

interface BatchCapacityBadgeProps {
  roasterType: RoasterType;
  currentWeight: number;
  className?: string;
}

export function BatchCapacityBadge({
  roasterType,
  currentWeight,
  className
}: BatchCapacityBadgeProps) {
  const spec = getRoasterSpec(roasterType);
  
  // Determine status
  const getStatus = () => {
    if (currentWeight > spec.maxBatchSize) {
      return { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: '⚠' };
    }
    if (currentWeight < spec.minBatchSize) {
      return { color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: '⚠' };
    }
    
    const deviation = Math.abs(currentWeight - spec.recommendedBatchSize) / spec.recommendedBatchSize;
    if (deviation <= 0.15) {
      return { color: 'bg-green-600/10 text-green-700 border-green-600/20', icon: '✓' };
    }
    return { color: 'bg-yellow-600/10 text-yellow-700 border-yellow-600/20', icon: '○' };
  };
  
  const status = getStatus();
  
  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
        status.color,
        className
      )}
    >
      <span className="text-xs">{status.icon}</span>
      <span>{currentWeight}g / {spec.maxBatchSize}g</span>
    </div>
  );
}
