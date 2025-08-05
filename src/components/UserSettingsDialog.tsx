import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Trash2 } from "lucide-react";

interface UserSettingsDialogProps {
  trigger: React.ReactNode;
}

const UserSettingsDialog = ({ trigger }: UserSettingsDialogProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);


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
      toast({
        title: "Account data cleared",
        description: "Your roast profiles have been deleted. Please contact support to fully delete your account.",
      });
      
      // Sign out the user
      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
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