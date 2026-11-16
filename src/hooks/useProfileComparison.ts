import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CompareRoast, CompareSlot } from '@/types/comparison.types';
import {
  deriveEventMarks,
  deriveRoastFacts,
  deriveRoastPhases,
  rowToCard,
  type ProfileRowInput,
} from '@/utils/roastProfileView';

/** Loads one roast for a compare slot. Public rows work signed-out. */
export function useCompareRoast(id: string | undefined, slot: CompareSlot) {
  return useQuery({
    queryKey: ['compare-roast', id, slot],
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<CompareRoast | null> => {
      const { data, error } = await supabase
        .from('roast_profiles')
        .select('*, likes:roast_profile_likes(count)')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const row = data as unknown as ProfileRowInput;
      const facts = deriveRoastFacts(row);
      return {
        id: row.id,
        slot,
        row,
        card: rowToCard(row),
        facts,
        phases: deriveRoastPhases(row, facts),
        marks: deriveEventMarks(row, facts),
      };
    },
  });
}

/** Both compare slots. */
export function useProfileComparison(aId?: string, bId?: string) {
  const a = useCompareRoast(aId, 'a');
  const b = useCompareRoast(bId, 'b');
  return { a, b };
}
