import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RoastCardData } from "@/components/roast-card/RoastCard";
import { rowSearchText, rowToCard, type ProfileRowInput } from "@/utils/roastProfileView";

export interface DiscoverRow extends RoastCardData {
  userId?: string;
  searchText: string;
}

/** Only the columns the cards need: no legacy temperature curves, likes counted in the same request. */
const PROFILE_COLUMNS =
  "id, user_id, beans_name, origin, farm_name, roast_process, coffee_roaster, roaster_type, duration_seconds, initial_weight, final_weight, crack_events, milestones, roaster_data, roaster_settings, created_at, likes:roast_profile_likes(count)";

export async function fetchDiscoverRows(): Promise<DiscoverRow[]> {
  const { data, error } = await supabase
    .from("roast_profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((raw) => {
    const row = raw as unknown as ProfileRowInput & { user_id?: string };
    return { ...rowToCard(row), userId: row.user_id, searchText: rowSearchText(row) };
  });
}

/** All public roasts as card data (shared by Discover and the Compare picker). */
export function useDiscoverRows(enabled = true) {
  return useQuery({ queryKey: ["discover-profiles"], queryFn: fetchDiscoverRows, enabled, staleTime: 60_000 });
}
