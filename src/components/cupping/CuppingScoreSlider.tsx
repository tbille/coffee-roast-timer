import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface CuppingScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
}

/** 0–100 score, presented plainly: a number out of 100, no colour judgement. */
export function CuppingScoreSlider({ value, onChange }: CuppingScoreSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Label id="cupping-score-label" htmlFor="cupping-score">Score</Label>
        <div className="font-mono text-2xl font-semibold tabular-nums text-foreground" aria-hidden>
          {value}
          <span className="ml-1 text-sm font-normal text-muted-foreground">/ 100</span>
        </div>
      </div>

      <Slider
        id="cupping-score"
        aria-labelledby="cupping-score-label"
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />

      <div className="flex justify-between font-mono text-xs tabular-nums text-muted-foreground" aria-hidden>
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}
