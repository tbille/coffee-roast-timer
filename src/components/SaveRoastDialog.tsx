/**
 * SaveRoastDialog Component
 * Updated to support multi-roaster data formats
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { type TemperatureUnit } from "@/utils/temperatureConversion";
import { Save } from "lucide-react";
import type { RoastData } from "@/types/roast-data.types";
import type { RoasterType } from "@/types/roaster.types";
import { AuthPrompt } from "@/components/AuthPrompt";

interface SaveRoastDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roastData: RoastData;
  onSaveSuccess?: () => void;
  roasterType: RoasterType;
  temperatureUnit: TemperatureUnit;
  /** Roasting time excluding pauses; falls back to endTime - startTime */
  durationSeconds?: number;
  /** Prefills the initial weight field (grams) */
  defaultInitialWeight?: number;
}

const SaveRoastDialog = ({ 
  isOpen, 
  onClose, 
  roastData, 
  onSaveSuccess,
  roasterType,
  temperatureUnit,
  durationSeconds: providedDuration,
  defaultInitialWeight
}: SaveRoastDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setSaving] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [formData, setFormData] = useState({
    beansName: "",
    origin: "",
    farmName: "",
    initialWeight: defaultInitialWeight ? String(defaultInitialWeight) : "",
    finalWeight: "",
    roastProcess: "",
    coffeeRoaster: "",
    environmentalNotes: ""
  });

  // Calculate duration from roast data
  const durationSeconds = providedDuration ?? (roastData.endTime
    ? Math.floor((roastData.endTime - roastData.startTime) / 1000)
    : 0);

  // Auto-save after successful authentication
  useEffect(() => {
    if (user && showAuthPrompt) {
      setShowAuthPrompt(false);
      // Auto-save if beans name is filled
      if (formData.beansName.trim()) {
        handleSave();
      }
    }
  }, [user]);

  const handleAuthSuccess = () => {
    // The useEffect above will handle the auto-save
    // This just provides a callback for the AuthPrompt component
  };

  const handleSave = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (!formData.beansName.trim()) {
      toast({
        title: "Beans Name Required",
        description: "Please enter the beans name to save your roast profile.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('roast_profiles')
        .insert({
          user_id: user.id,
          beans_name: formData.beansName.trim(),
          origin: formData.origin.trim() || null,
          farm_name: formData.farmName.trim() || null,
          roast_process: formData.roastProcess.trim() || null,
          coffee_roaster: formData.coffeeRoaster.trim() || null,
          initial_weight: formData.initialWeight ? parseFloat(formData.initialWeight) : null,
          final_weight: formData.finalWeight ? parseFloat(formData.finalWeight) : null,
          duration_seconds: durationSeconds,
          temperature_unit: temperatureUnit,
          environmental_notes: formData.environmentalNotes.trim() || null,
          // NEW: Multi-roaster support fields
          roaster_type: roasterType,
          roaster_data: roastData as any,
          // Legacy fields for backward compatibility
          temperature_data: (roastData as any).temperatureData || [],
          crack_events: roastData.crackEvents || []
        });

      if (error) throw error;

      toast({
        title: "Roast Profile Saved",
        description: "Your roast has been saved successfully!"
      });

      // Reset form
      setFormData({
        beansName: "",
        origin: "",
        farmName: "",
        initialWeight: "",
        finalWeight: "",
        roastProcess: "",
        coffeeRoaster: "",
        environmentalNotes: ""
      });

      // Close dialog
      onClose();
      
      // Call success callback
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('Error saving roast profile:', error);
      toast({
        title: "Error",
        description: "Failed to save roast profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Roast Profile
          </DialogTitle>
          <DialogDescription>
            {showAuthPrompt 
              ? "Create an account or sign in to save your roast profile"
              : `Record the details of your ${durationSeconds > 0 ? `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, '0')}` : ''} roast`
            }
          </DialogDescription>
        </DialogHeader>

        {showAuthPrompt ? (
          <div className="py-4">
            <AuthPrompt onAuthSuccess={handleAuthSuccess} />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
          {/* Required: Beans Name */}
          <div className="grid gap-2">
            <Label htmlFor="beansName" className="flex items-center gap-1">
              Beans Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="beansName"
              value={formData.beansName}
              onChange={(e) => setFormData({ ...formData, beansName: e.target.value })}
              placeholder="e.g., Ethiopian Yirgacheffe"
              required
            />
          </div>

          {/* Origin */}
          <div className="grid gap-2">
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              placeholder="e.g., Ethiopia, Colombia"
            />
          </div>

          {/* Farm Name */}
          <div className="grid gap-2">
            <Label htmlFor="farmName">Farm/Coop Name</Label>
            <Input
              id="farmName"
              value={formData.farmName}
              onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
              placeholder="e.g., Kochere Washing Station"
            />
          </div>

          {/* Weights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="initialWeight">Initial Weight (g)</Label>
              <Input
                id="initialWeight"
                type="number"
                value={formData.initialWeight}
                onChange={(e) => setFormData({ ...formData, initialWeight: e.target.value })}
                placeholder="e.g., 225"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="finalWeight">Final Weight (g)</Label>
              <Input
                id="finalWeight"
                type="number"
                value={formData.finalWeight}
                onChange={(e) => setFormData({ ...formData, finalWeight: e.target.value })}
                placeholder="e.g., 190"
              />
            </div>
          </div>

          {/* Roast Process */}
          <div className="grid gap-2">
            <Label htmlFor="roastProcess">Roast Level/Process</Label>
            <Input
              id="roastProcess"
              value={formData.roastProcess}
              onChange={(e) => setFormData({ ...formData, roastProcess: e.target.value })}
              placeholder="e.g., Medium, City+, Full City"
            />
          </div>

          {/* Coffee Roaster (legacy field) */}
          <div className="grid gap-2">
            <Label htmlFor="coffeeRoaster">Additional Roaster Notes</Label>
            <Input
              id="coffeeRoaster"
              value={formData.coffeeRoaster}
              onChange={(e) => setFormData({ ...formData, coffeeRoaster: e.target.value })}
              placeholder="e.g., modifications, accessories used"
            />
          </div>

          {/* Environmental Notes */}
          <div className="grid gap-2">
            <Label htmlFor="environmentalNotes">Environmental Notes</Label>
            <Textarea
              id="environmentalNotes"
              value={formData.environmentalNotes}
              onChange={(e) => setFormData({ ...formData, environmentalNotes: e.target.value })}
              placeholder="e.g., ambient temperature, humidity, outdoor conditions"
              rows={3}
            />
          </div>

          {/* Roast Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Roast Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Duration:</div>
              <div className="font-mono">
                {Math.floor(durationSeconds / 60)}:{String(durationSeconds % 60).padStart(2, '0')}
              </div>
              
              <div className="text-muted-foreground">First Crack:</div>
              <div>
                {roastData.crackEvents?.find(e => e.type === 'first') 
                  ? `${Math.floor(roastData.crackEvents.find(e => e.type === 'first')!.time / 60)}:${String(roastData.crackEvents.find(e => e.type === 'first')!.time % 60).padStart(2, '0')}`
                  : 'Not recorded'
                }
              </div>
              
              <div className="text-muted-foreground">Second Crack:</div>
              <div>
                {roastData.crackEvents?.find(e => e.type === 'second') 
                  ? `${Math.floor(roastData.crackEvents.find(e => e.type === 'second')!.time / 60)}:${String(roastData.crackEvents.find(e => e.type === 'second')!.time % 60).padStart(2, '0')}`
                  : 'Not recorded'
                }
              </div>
            </div>
          </div>
        </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {!showAuthPrompt && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Roast Profile"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveRoastDialog;
