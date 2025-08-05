import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface RoastData {
  time: number;
  targetTemp: number;
  currentTemp: number;
}

interface CrackEvent {
  time: number;
  targetTemp: number;
  currentTemp: number;
  type: 'first' | 'second';
}

interface SaveRoastDialogProps {
  elapsedTime: number;
  roastData: RoastData[];
  crackEvents: CrackEvent[];
  disabled?: boolean;
}

const SaveRoastDialog = ({ elapsedTime, roastData, crackEvents, disabled }: SaveRoastDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    beansName: "",
    origin: "",
    farmName: "",
    initialWeight: "",
    finalWeight: "",
    roastProcess: "",
    coffeeRoaster: ""
  });

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please create an account to save your roast profiles.",
        variant: "destructive"
      });
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
          duration_seconds: elapsedTime,
          temperature_data: roastData as any,
          crack_events: crackEvents as any
        });

      if (error) throw error;

      toast({
        title: "Roast Profile Saved",
        description: "Your roast profile has been saved successfully!"
      });

      // Clear the persisted roast state after successful save
      localStorage.removeItem('roastTimerState');

      setOpen(false);
      setFormData({
        beansName: "",
        origin: "",
        farmName: "",
        initialWeight: "",
        finalWeight: "",
        roastProcess: "",
        coffeeRoaster: ""
      });
    } catch (error) {
      console.error('Error saving roast profile:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your roast profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAccount = () => {
    window.location.href = '/auth';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={disabled} 
          className="flex items-center gap-2 mx-auto"
          variant="outline"
        >
          <Save className="h-4 w-4" />
          Save Roast Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Roast Profile</DialogTitle>
          <DialogDescription>
            {user 
              ? "Save your roast data for future reference."
              : "Create an account to save your roast profiles and access them later."
            }
          </DialogDescription>
        </DialogHeader>
        
        {!user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You need to be logged in to save roast profiles. Create an account to get started!
            </p>
            <div className="flex gap-2">
              <Button onClick={handleCreateAccount} className="flex-1">
                Create Account
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="beans-name">Beans Name *</Label>
              <Input
                id="beans-name"
                value={formData.beansName}
                onChange={(e) => setFormData(prev => ({ ...prev, beansName: e.target.value }))}
                placeholder="e.g., Ethiopian Yirgacheffe"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                placeholder="e.g., Ethiopia"
              />
            </div>
            
            
            <div>
              <Label htmlFor="roast-process">Process</Label>
              <Input
                id="roast-process"
                value={formData.roastProcess}
                onChange={(e) => setFormData(prev => ({ ...prev, roastProcess: e.target.value }))}
                placeholder="e.g., Washed, Natural, Honey"
              />
            </div>
            
            <div>
              <Label htmlFor="farm-name">Farm Name</Label>
              <Input
                id="farm-name"
                value={formData.farmName}
                onChange={(e) => setFormData(prev => ({ ...prev, farmName: e.target.value }))}
                placeholder="e.g., Kochere Washing Station"
              />
            </div>
            
            <div>
              <Label htmlFor="coffee-roaster">Coffee Roaster</Label>
              <Input
                id="coffee-roaster"
                value={formData.coffeeRoaster}
                onChange={(e) => setFormData(prev => ({ ...prev, coffeeRoaster: e.target.value }))}
                placeholder="e.g., Gene CBR-101, Behmor 1600+"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initial-weight">Initial Weight (g)</Label>
                <Input
                  id="initial-weight"
                  type="number"
                  value={formData.initialWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, initialWeight: e.target.value }))}
                  placeholder="e.g., 250"
                />
              </div>
              
              <div>
                <Label htmlFor="final-weight">Final Weight (g)</Label>
                <Input
                  id="final-weight"
                  type="number"
                  value={formData.finalWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalWeight: e.target.value }))}
                  placeholder="e.g., 200"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Profile"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SaveRoastDialog;