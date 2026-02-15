import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface CuppingScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function CuppingScoreSlider({ value, onChange }: CuppingScoreSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label htmlFor="cupping-score">Cupping Score</Label>
        <div className="text-2xl font-semibold text-gray-700">
          {value}/100
        </div>
      </div>
      
      <Slider
        id="cupping-score"
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>0 - Poor</span>
        <span>50 - Average</span>
        <span>100 - Exceptional</span>
      </div>
    </div>
  );
}
