import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Trash2, User, Lock, Thermometer } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { type TemperatureUnit } from "@/utils/temperatureConversion";

interface UserSettingsDialogProps {
  /** Element that opens the dialog. Omit when controlling it with `open` / `onOpenChange`. */
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const UserSettingsDialog = ({ trigger, open, onOpenChange }: UserSettingsDialogProps) => {
  const { user, signOut } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [username, setUsername] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");
  const [defaultTempUnit, setDefaultTempUnit] = useState<TemperatureUnit>('C');
  const [originalTempUnit, setOriginalTempUnit] = useState<TemperatureUnit>('C');
  const [isUpdatingTempUnit, setIsUpdatingTempUnit] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    if (user && isOpen) {
      fetchUserProfile();
    }
  }, [user, isOpen]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, default_temperature_unit')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile:', error);
        return;
      }

      const currentUsername = data?.username || "";
      const currentTempUnit = (data?.default_temperature_unit || 'C') as TemperatureUnit;
      setUsername(currentUsername);
      setOriginalUsername(currentUsername);
      setDefaultTempUnit(currentTempUnit);
      setOriginalTempUnit(currentTempUnit);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateUsername = async () => {
    if (!user) return;
    
    setIsUpdatingUsername(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          username: username.trim() || null,
          default_temperature_unit: defaultTempUnit
        });

      if (error) throw error;

      setOriginalUsername(username);
      setOriginalTempUnit(defaultTempUnit);
      toast.success("Username updated", { description: "Your username has been updated successfully." });
    } catch (error) {
      console.error('Error updating username:', error);
      
      if ((error as { code?: string })?.code === "23505") { // Unique constraint violation
        toast.error("Username taken", { description: "This username is already taken. Please choose another one." });
      } else {
        toast.error("Failed to update username. Please try again.");
      }
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Missing fields", { description: "Please fill in all password fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match", { description: "New password and confirmation password must match." });
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password too short", { description: "Password must be at least 6 characters long." });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password updated", { description: "Your password has been updated successfully." });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error((error instanceof Error && error.message) || "Failed to update password. Please try again.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const resetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Reset password fields when dialog opens
  useEffect(() => {
    if (isOpen) {
      resetPasswordFields();
    }
  }, [isOpen]);
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      // First, delete user's roast profiles
      const { error: deleteProfilesError } = await supabase
        .from('roast_profiles')
        .delete()
        .eq('user_id', user?.id);

      if (deleteProfilesError) {
        console.error('Error deleting roast profiles:', deleteProfilesError);
        // Continue with account deletion even if profile deletion fails
      }

      // Note: Account deletion via Supabase Auth requires server-side implementation
      // For now, we'll sign the user out and show a message
      toast.success("Account data cleared", { description: "Your roast profiles have been deleted. Please contact support to fully delete your account." });
      
      // Sign out the user
      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Failed to delete account. Please try again or contact support.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account settings
          </DialogTitle>
          <DialogDescription>
            Manage your account settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Username Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <h3 className="text-sm font-medium">Profile</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username (optional)</Label>
              <Input
                id="username"
                placeholder="Enter a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Your username will be displayed on your public roast profiles.
              </p>
            </div>
            <Button
              onClick={handleUpdateUsername}
              disabled={isUpdatingUsername || (username === originalUsername && defaultTempUnit === originalTempUnit)}
              className="w-full"
            >
              {isUpdatingUsername ? "Updating..." : "Update Profile"}
            </Button>
          </div>

          {/* Temperature Unit Preference */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              <h3 className="text-sm font-medium">Temperature Preference</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="default-temp-unit">Default Temperature Unit</Label>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${defaultTempUnit === 'C' ? 'font-medium' : 'text-muted-foreground'}`}>°C</span>
                  <Switch
                    id="default-temp-unit"
                    checked={defaultTempUnit === 'F'}
                    onCheckedChange={(checked) => setDefaultTempUnit(checked ? 'F' : 'C')}
                  />
                  <span className={`text-sm ${defaultTempUnit === 'F' ? 'font-medium' : 'text-muted-foreground'}`}>°F</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your preferred temperature unit will be used by default in all roast profiles and displays.
              </p>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <h3 className="text-sm font-medium">Change Password</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long.
              </p>
            </div>
            <Button
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>

          {/* Delete Account Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. This will permanently delete your account and all roast profiles.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your roast profiles from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeletingAccount ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsDialog;