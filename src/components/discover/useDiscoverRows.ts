import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RoastCardData } from "@/components/roast-card/RoastCard";
import { rowSearchText, rowToCard, type ProfileRowInput } from "@/utils/roastProfileView";
import { withVisibilityFallback } from "@/lib/visibility";

export interface DiscoverRow extends RoastCardData {
  userId?: string;
  searchText: string;
}

/** Only the columns the cards need: no legacy temperature curves, likes counted in the same request. */
const PROFILE_COLUMNS =
  "id, user_id, beans_name, origin, farm_name, roast_process, coffee_roaster, roaster_type, duration_seconds, initial_weight, final_weight, crack_events, milestones, roaster_data, roaster_settings, created_at, likes:roast_profile_likes(count)";

function toDiscoverRows(data: unknown[] | null): DiscoverRow[] {
  return (data ?? []).map((raw) => {
    const row = raw as ProfileRowInput & { user_id?: string };
    return { ...rowToCard(row), userId: row.user_id, searchText: rowSearchText(row) };
  });
}

/** Public roasts only: private and link-only roasts never appear in lists. */
export async function fetchDiscoverRows(): Promise<DiscoverRow[]> {
  const { data, error } = await withVisibilityFallback("discover", (hasColumn) => {
    const query = supabase.from("roast_profiles").select(PROFILE_COLUMNS);
    return (hasColumn ? query.eq("visibility", "public") : query).order("created_at", { ascending: false });
  });
  if (error) throw error;
  return toDiscoverRows(data);
}

/** One account's roasts, whatever their visibility (RLS returns private rows only to their owner). */
export async function fetchOwnRows(userId: string): Promise<DiscoverRow[]> {
  const { data, error } = await supabase
    .from("roast_profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return toDiscoverRows(data);
}

/** All public roasts as card data (shared by Discover and the Compare picker). */
export function useDiscoverRows(enabled = true) {
  return useQuery({ queryKey: ["discover-profiles"], queryFn: fetchDiscoverRows, enabled, staleTime: 60_000 });
}

/** The signed-in roaster's own roasts as card data, private ones included (Compare picker "My roasts"). */
export function useOwnRoastRows(userId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["discover-profiles", "mine", userId],
    queryFn: () => fetchOwnRows(userId!),
    enabled: enabled && !!userId,
    staleTime: 60_000,
  });
}
