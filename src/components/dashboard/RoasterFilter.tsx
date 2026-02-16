import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Coffee } from "lucide-react";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import type { RoasterType } from "@/types/roaster.types";

interface RoasterFilterProps {
  value: RoasterType | "all";
  onChange: (value: RoasterType | "all") => void;
  className?: string;
}

export const RoasterFilter = ({ value, onChange, className = "" }: RoasterFilterProps) => {
  const roasters = Object.values(ROASTER_SPECS);
  
  const getSelectedLabel = (): string => {
    if (value === "all") return "All roasters";
    if (value === "unknown") return "Unknown/Unspecified";
    const roaster = ROASTER_SPECS[value];
    return roaster ? `${roaster.manufacturer} ${roaster.name}` : value;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Coffee className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <Label htmlFor="roaster-filter" className="sr-only">Filter profiles by coffee roaster equipment</Label>
        <Select 
          value={value} 
          onValueChange={(val) => onChange(val as RoasterType | "all")}
        >
          <SelectTrigger 
            id="roaster-filter" 
            className="w-full"
            aria-label={`Filter by roaster. Currently showing: ${getSelectedLabel()}`}
          >
            <SelectValue placeholder="All roasters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" aria-label="Show profiles from all roaster types">
              All roasters
            </SelectItem>
            <SelectItem value="unknown" aria-label="Show profiles with unknown or unspecified roaster">
              Unknown/Unspecified
            </SelectItem>
            {roasters
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((roaster) => (
                <SelectItem 
                  key={roaster.id} 
                  value={roaster.id}
                  aria-label={`Filter to show only ${roaster.manufacturer} ${roaster.name} profiles`}
                >
                  {roaster.name} - {roaster.manufacturer}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
