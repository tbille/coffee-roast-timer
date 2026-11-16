import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BREW_METHODS } from '@/types/cupping.types';
import { Coffee } from 'lucide-react';

interface BrewMethodSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function BrewMethodSelect({ value, onChange }: BrewMethodSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="brew-method">Brew method</Label>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger id="brew-method" className="w-full">
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            <SelectValue placeholder="Choose a brew method" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {BREW_METHODS.map((method) => (
            <SelectItem key={method} value={method}>
              {method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
