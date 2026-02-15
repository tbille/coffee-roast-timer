import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RoastProfile } from '@/types/roast.types';
import { ComparisonProfile, getComparisonColor } from '@/types/comparison.types';
import { calculateProfileStatistics } from '@/utils/roastStatistics';

export function useProfileComparison(profileIds: string[]) {
  return useQuery({
    queryKey: ['profile_comparison', ...profileIds.sort()],
    queryFn: async (): Promise<ComparisonProfile[]> => {
      if (profileIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('roast_profiles')
        .select('*, profiles(username)')
        .in('id', profileIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((profile: any, index) => {
        // Parse JSON fields
        const parsedProfile: RoastProfile = {
          ...profile,
          temperature_data: Array.isArray(profile.temperature_data) 
            ? profile.temperature_data 
            : [],
          crack_events: Array.isArray(profile.crack_events) 
            ? profile.crack_events 
            : [],
          temperature_unit: (profile.temperature_unit || 'C') as 'C' | 'F',
        };

        return {
          profile: parsedProfile,
          statistics: calculateProfileStatistics(parsedProfile),
          color: getComparisonColor(index),
        };
      });
    },
    enabled: profileIds.length > 0 && profileIds.length <= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
