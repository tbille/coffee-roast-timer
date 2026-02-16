import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cloud, MapPin } from "lucide-react";
import type { EnvironmentalData } from "@/types/roast-data.types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface EnvironmentalTrackerProps {
  data: Partial<EnvironmentalData>;
  onChange: (data: Partial<EnvironmentalData>) => void;
}

export const EnvironmentalTracker = ({ 
  data, 
  onChange 
}: EnvironmentalTrackerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (field: keyof EnvironmentalData, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Environmental Conditions
                <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </CardTitle>
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Location */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                Roasting Location
              </Label>
              <RadioGroup
                value={data.location || 'indoor'}
                onValueChange={(value) => handleChange('location', value as 'indoor' | 'outdoor')}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="indoor" id="indoor" />
                    <Label htmlFor="indoor" className="font-normal cursor-pointer">
                      Indoor
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="outdoor" id="outdoor" />
                    <Label htmlFor="outdoor" className="font-normal cursor-pointer">
                      Outdoor
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Ambient Temperature */}
            <div className="space-y-2">
              <Label htmlFor="ambient-temp" className="text-sm font-medium">
                Ambient Temperature (°C)
              </Label>
              <Input
                id="ambient-temp"
                type="number"
                placeholder="e.g., 22"
                value={data.ambientTemp || ''}
                onChange={(e) => handleChange('ambientTemp', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-32"
              />
            </div>

            {/* Humidity */}
            <div className="space-y-2">
              <Label htmlFor="humidity" className="text-sm font-medium">
                Humidity (%)
              </Label>
              <Input
                id="humidity"
                type="number"
                placeholder="e.g., 65"
                value={data.humidity || ''}
                onChange={(e) => handleChange('humidity', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-32"
                min="0"
                max="100"
              />
            </div>

            {/* Wind Conditions */}
            <div className="space-y-2">
              <Label htmlFor="wind" className="text-sm font-medium">
                Wind Conditions
              </Label>
              <Select
                value={data.windConditions || ''}
                onValueChange={(value) => handleChange('windConditions', value)}
              >
                <SelectTrigger id="wind">
                  <SelectValue placeholder="Select wind conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="Calm">Calm</SelectItem>
                  <SelectItem value="Light breeze">Light breeze</SelectItem>
                  <SelectItem value="Moderate breeze">Moderate breeze</SelectItem>
                  <SelectItem value="Windy">Windy</SelectItem>
                  <SelectItem value="Strong wind">Strong wind</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="env-notes" className="text-sm font-medium">
                Environmental Notes
              </Label>
              <Textarea
                id="env-notes"
                placeholder="e.g., Moderate breeze from west, cloudy sky..."
                value={(data as any).notes || ''}
                onChange={(e) => handleChange('notes' as any, e.target.value)}
                className="min-h-20 resize-none"
              />
            </div>

            {/* Helper Text */}
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">
                💡 Environmental factors (especially wind) significantly affect outdoor roasting. 
                Track these for more consistent results.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
