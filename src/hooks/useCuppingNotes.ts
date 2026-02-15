import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CuppingNotes } from '@/types/cupping.types';

export function useUpdateCuppingNotes(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cuppingNotes: Partial<CuppingNotes>) => {
      console.log('Updating cupping notes for profile:', profileId);
      console.log('Data being sent:', cuppingNotes);
      
      // First, verify the user can access this profile
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      // Check if profile exists and get its user_id
      const { data: profile, error: fetchError } = await supabase
        .from('roast_profiles')
        .select('user_id')
        .eq('id', profileId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw new Error('Profile not found');
      }
      
      console.log('Profile user_id:', profile?.user_id);
      console.log('Does user own profile?', user?.id === profile?.user_id);
      
      const { data, error } = await supabase
        .from('roast_profiles')
        .update(cuppingNotes as any)
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('Update successful:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['roast_profile', profileId] });
    },
  });
}
