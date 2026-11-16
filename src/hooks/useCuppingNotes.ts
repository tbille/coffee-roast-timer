import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { CuppingNotes } from '@/types/cupping.types';

type ProfileUpdate = Database['public']['Tables']['roast_profiles']['Update'];

/** Nullable version of the cupping fields, as written to roast_profiles. */
export type CuppingNotesUpdate = { [K in keyof CuppingNotes]?: CuppingNotes[K] | null };

export function useUpdateCuppingNotes(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cuppingNotes: CuppingNotesUpdate) => {
      const { data, error } = await supabase
        .from('roast_profiles')
        .update(cuppingNotes as ProfileUpdate)
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roast_profile', profileId] });
    },
  });
}
