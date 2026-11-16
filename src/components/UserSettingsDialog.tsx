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

  // Fetch the account's settings each time the dialog opens
  const userId = user?.id;
  useEffect(() => {
    if (!userId || !isOpen) return;
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, default_temperature_unit')
          .eq('id', userId)
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
    fetchUserProfile();
  }, [userId, isOpen]);

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
      toast.success("Profile saved", { description: "Shown on the roasts you save." });
    } catch (error) {
      console.error('Error updating username:', error);
      
      if ((error as { code?: string })?.code === "23505") { // Unique constraint violation
        toast.error("Username taken", { description: "Choose another username." });
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
      toast.error("Missing fields", { description: "Fill in all three password fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match", { description: "The new password and its confirmation differ." });
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

      toast.success("Password updated", { description: "Use it next time you sign in." });
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
      toast.success("Roasts deleted", { description: "Your roasts were deleted. Contact us to remove the sign-in itself." });
      
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            Account settings
          </DialogTitle>
          <DialogDescription>
            Your public name, units, password and data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="divide-y [&>*]:py-6 [&>*:first-child]:pt-2 [&>*:last-child]:pb-0">
          {/* Username Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
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
                Shown on the roasts you save (they are visible on Discover).
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleUpdateUsername}
              disabled={isUpdatingUsername || (username === originalUsername && defaultTempUnit === originalTempUnit)}
              className="h-11 w-full"
            >
              {isUpdatingUsername ? "Saving…" : "Save profile"}
            </Button>
          </div>

          {/* Temperature Unit Preference */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
              <h3 className="text-sm font-medium">Temperature unit</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="default-temp-unit">Default unit</Label>
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
                Used by default on the timer and roast pages. Saved with "Save profile".
              </p>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
              <h3 className="text-sm font-medium">Change password</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
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
              variant="outline"
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="h-11 w-full"
            >
              {isUpdatingPassword ? "Updating…" : "Update password"}
            </Button>
          </div>

          {/* Delete Account Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.75} aria-hidden />
              <h3 className="text-sm font-medium text-destructive">Delete account</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This permanently deletes every roast in your account. It cannot be undone.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-11 w-full">
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All your roasts are removed from Roast Timer and Discover, and you are signed out. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my account</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeletingAccount ? "Deleting…" : "Delete account"}
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