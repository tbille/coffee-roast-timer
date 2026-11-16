import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { syncPendingDrafts } from "@/lib/saveRoast";

/**
 * Mounted once app-wide. When someone is signed in (on load or right after
 * signing in), roasts kept on this device are saved to their account.
 */
export function DraftSync() {
  const { user } = useAuth();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (!userId || lastUserId.current === userId) {
      lastUserId.current = userId;
      return;
    }
    lastUserId.current = userId;
    let cancelled = false;
    syncPendingDrafts(userId).then(({ saved, failed }) => {
      if (cancelled) return;
      if (saved > 0) {
        toast.success(saved === 1 ? "1 roast from this device saved to your account" : `${saved} roasts from this device saved to your account`);
      }
      if (failed > 0) {
        toast.error(failed === 1 ? "1 roast could not be synced. It is still on this device." : `${failed} roasts could not be synced. They are still on this device.`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return null;
}
