import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Coffee } from "lucide-react";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import { getRoasterPrimaryColor } from "@/utils/roasterColors";
import type { RoasterType } from "@/types/roaster.types";

interface RoasterFilterProps {
  value: RoasterType | "all" | "unknown";
  onChange: (value: RoasterType | "all" | "unknown") => void;
  profileCounts?: Record<string, number>;
  className?: string;
}

export const RoasterFilter = ({ value, onChange, profileCounts, className = "" }: RoasterFilterProps) => {
  const roasters = Object.values(ROASTER_SPECS);
  
  const getSelectedLabel = (): string => {
    if (value === "all") {
      const count = profileCounts?.total ?? 0;
      return count > 0 ? `All roasters (${count})` : "All roasters";
    }
    if (value === "unknown") {
      const count = profileCounts?.unknown ?? 0;
      return count > 0 ? `Unknown/Unspecified (${count})` : "Unknown/Unspecified";
    }
    const roaster = ROASTER_SPECS[value];
    const count = profileCounts?.[value] ?? 0;
    const name = roaster ? `${roaster.manufacturer} ${roaster.name}` : value;
    return count > 0 ? `${name} (${count})` : name;
  };

  // Group roasters by whether they have profiles or not
  const activeRoasters = roasters.filter(r => (profileCounts?.[r.id] ?? 0) > 0);
  const emptyRoasters = roasters.filter(r => (profileCounts?.[r.id] ?? 0) === 0);

  // Sort active roasters by count (descending), then alphabetically
  activeRoasters.sort((a, b) => {
    const countA = profileCounts?.[a.id] ?? 0;
    const countB = profileCounts?.[b.id] ?? 0;
    if (countA !== countB) {
      return countB - countA; // More profiles first
    }
    return a.name.localeCompare(b.name);
  });

  // Sort empty roasters alphabetically
  emptyRoasters.sort((a, b) => a.name.localeCompare(b.name));

  const totalCount = profileCounts?.total ?? 0;
  const unknownCount = profileCounts?.unknown ?? 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Coffee className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <Label htmlFor="roaster-filter" className="sr-only">Filter profiles by coffee roaster equipment</Label>
        <Select 
          value={value} 
          onValueChange={(val) => onChange(val as RoasterType | "all" | "unknown")}
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
              <span className="flex items-center gap-2">
                <span>All roasters</span>
                {totalCount > 0 && (
                  <span className="text-muted-foreground ml-auto">({totalCount})</span>
                )}
              </span>
            </SelectItem>
            <SelectItem value="unknown" aria-label="Show profiles with unknown or unspecified roaster">
              <span className="flex items-center gap-2">
                <span>Unknown/Unspecified</span>
                {unknownCount > 0 && (
                  <span className="text-muted-foreground ml-auto">({unknownCount})</span>
                )}
              </span>
            </SelectItem>
            
            {activeRoasters.length > 0 && (
              <>
                <SelectSeparator />
                {activeRoasters.map((roaster) => {
                  const count = profileCounts?.[roaster.id] ?? 0;
                  return (
                    <SelectItem 
                      key={roaster.id} 
                      value={roaster.id}
                      aria-label={`Filter to show only ${roaster.manufacturer} ${roaster.name} profiles. ${count} profile${count !== 1 ? 's' : ''} available.`}
                    >
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: getRoasterPrimaryColor(roaster.id) }}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{roaster.name} - {roaster.manufacturer}</span>
                        <span className="text-muted-foreground ml-2">({count})</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </>
            )}
            
            {emptyRoasters.length > 0 && (
              <>
                <SelectSeparator />
                {emptyRoasters.map((roaster) => (
                  <SelectItem 
                    key={roaster.id} 
                    value={roaster.id}
                    aria-label={`Filter to show only ${roaster.manufacturer} ${roaster.name} profiles. No profiles available yet.`}
                    className="opacity-60"
                  >
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: getRoasterPrimaryColor(roaster.id) }}
                        aria-hidden="true"
                      />
                      <span className="flex-1">{roaster.name} - {roaster.manufacturer}</span>
                      <span className="text-muted-foreground ml-2">(0)</span>
                    </span>
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
