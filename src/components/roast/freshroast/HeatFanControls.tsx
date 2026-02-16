import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HeatLevel, FanSpeed } from "@/types/roast-data.types";

interface HeatFanControlsProps {
  type: 'heat' | 'fan';
  value: HeatLevel | FanSpeed;
  onChange: (value: HeatLevel | FanSpeed) => void;
  label: string;
  icon?: React.ReactNode;
}

export const HeatFanControls = ({ 
  type, 
  value, 
  onChange, 
  label,
  icon 
}: HeatFanControlsProps) => {
  const options: Array<HeatLevel | FanSpeed> = ['Low', 'Medium', 'High'];
  
  const getButtonClasses = (option: string) => {
    const isSelected = option === value;
    const baseClasses = "flex-1 h-12 font-medium transition-all";
    
    if (type === 'heat') {
      return `${baseClasses} ${
        isSelected 
          ? 'bg-orange-500 text-white hover:bg-orange-600 border-orange-600' 
          : 'bg-background hover:bg-accent'
      }`;
    } else {
      return `${baseClasses} ${
        isSelected 
          ? 'bg-cyan-500 text-white hover:bg-cyan-600 border-cyan-600' 
          : 'bg-background hover:bg-accent'
      }`;
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        </div>
        
        <div className="flex gap-2">
          {options.map((option) => (
            <Button
              key={option}
              variant={option === value ? "default" : "outline"}
              className={getButtonClasses(option)}
              onClick={() => onChange(option)}
              aria-label={`Set ${type} to ${option}`}
              aria-pressed={option === value}
            >
              {option}
            </Button>
          ))}
        </div>
        
        <div className="mt-3 text-center">
          <span className="text-xs text-muted-foreground">
            Current: <span className="font-semibold text-foreground">{value}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
