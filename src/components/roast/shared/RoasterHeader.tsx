/**
 * RoasterHeader Component
 * Roaster name, mode subtitle and an editable batch size with capacity badge.
 */

import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BatchCapacityBadge } from './BatchCapacityBadge';
import { getRoasterSpec } from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';

interface RoasterHeaderProps {
  roasterType: RoasterType;
  subtitle: string;
  batchSize: number;
  onBatchSizeChange: (grams: number) => void;
  /** Batch size can only be changed before the roast starts */
  batchLocked: boolean;
  /** Hide the batch editor when the mode has its own (e.g. popcorn safety widget) */
  showBatchInput?: boolean;
  /** Extra controls rendered under the title (e.g. Behmor profile picker) */
  children?: ReactNode;
}

export function RoasterHeader({
  roasterType,
  subtitle,
  batchSize,
  onBatchSizeChange,
  batchLocked,
  showBatchInput = true,
  children,
}: RoasterHeaderProps) {
  const spec = getRoasterSpec(roasterType);
  const inputId = `${roasterType}-batch-size`;

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
              <span className="text-xl">☕</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">{spec.displayName}</h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showBatchInput && (
              <>
                <Label htmlFor={inputId} className="text-sm text-muted-foreground whitespace-nowrap">
                  Batch (g)
                </Label>
                <Input
                  id={inputId}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={5}
                  value={batchSize || ''}
                  onChange={e => onBatchSizeChange(Math.max(0, Number(e.target.value) || 0))}
                  disabled={batchLocked}
                  className="w-20 h-8"
                />
              </>
            )}
            <BatchCapacityBadge roasterType={roasterType} currentWeight={batchSize} />
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
