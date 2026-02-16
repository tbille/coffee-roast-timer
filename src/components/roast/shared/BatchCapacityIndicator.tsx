/**
 * BatchCapacityIndicator Component
 * Shows batch size progress bar with roaster-aware warnings
 */

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getRoasterSpec } from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';

interface BatchCapacityIndicatorProps {
  roasterType: RoasterType;
  currentWeight: number;
  className?: string;
}

export function BatchCapacityIndicator({
  roasterType,
  currentWeight,
  className
}: BatchCapacityIndicatorProps) {
  const spec = getRoasterSpec(roasterType);
  
  // Calculate percentage of max capacity
  const percentage = (currentWeight / spec.maxBatchSize) * 100;
  
  // Determine color based on capacity
  const getColorClass = () => {
    if (currentWeight > spec.maxBatchSize) {
      return 'text-destructive';
    }
    if (currentWeight < spec.minBatchSize) {
      return 'text-orange-500';
    }
    
    const deviation = Math.abs(currentWeight - spec.recommendedBatchSize) / spec.recommendedBatchSize;
    if (deviation <= 0.15) {
      return 'text-green-600'; // Within 15% of recommended
    }
    if (deviation <= 0.30) {
      return 'text-yellow-600'; // Within 30% of recommended
    }
    return 'text-orange-500';
  };
  
  const getProgressColor = () => {
    if (currentWeight > spec.maxBatchSize) {
      return 'bg-destructive';
    }
    if (currentWeight < spec.minBatchSize) {
      return 'bg-orange-500';
    }
    
    const deviation = Math.abs(currentWeight - spec.recommendedBatchSize) / spec.recommendedBatchSize;
    if (deviation <= 0.15) {
      return 'bg-green-600';
    }
    if (deviation <= 0.30) {
      return 'bg-yellow-600';
    }
    return 'bg-orange-500';
  };
  
  const getMessage = () => {
    if (currentWeight > spec.maxBatchSize) {
      return '⚠ Exceeds maximum capacity - reduce batch size';
    }
    if (currentWeight < spec.minBatchSize) {
      return '⚠ Below minimum capacity - increase batch size';
    }
    
    const deviation = Math.abs(currentWeight - spec.recommendedBatchSize) / spec.recommendedBatchSize;
    if (deviation <= 0.15) {
      return '✓ Optimal batch size';
    }
    if (deviation <= 0.30) {
      return `Recommended: ${spec.recommendedBatchSize}g for best results`;
    }
    return `Consider ${spec.recommendedBatchSize}g for most consistent roasting`;
  };
  
  const colorClass = getColorClass();
  const progressColorClass = getProgressColor();
  
  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            ⚖️ Batch Capacity
          </label>
          <span className={cn('text-sm font-semibold', colorClass)}>
            {currentWeight}g / {spec.maxBatchSize}g
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <Progress 
            value={Math.min(percentage, 100)} 
            className="h-3"
          />
          <div 
            className={cn('absolute inset-0 rounded-full transition-all', progressColorClass)}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
          
          {/* Recommended marker */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
            style={{ left: `${(spec.recommendedBatchSize / spec.maxBatchSize) * 100}%` }}
            aria-label="Recommended batch size"
          />
        </div>
        
        {/* Message */}
        <p className={cn('text-xs', colorClass)}>
          {getMessage()}
        </p>
        
        {/* Capacity range */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: {spec.minBatchSize}g</span>
          <span>Recommended: {spec.recommendedBatchSize}g</span>
          <span>Max: {spec.maxBatchSize}g</span>
        </div>
      </div>
    </Card>
  );
}
