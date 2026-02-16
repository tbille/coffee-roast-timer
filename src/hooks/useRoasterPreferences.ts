/**
 * useRoasterPreferences Hook
 * Manages user's roaster equipment preferences and usage tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RoasterType, UserRoasterPreference } from '@/types/roaster.types';

/**
 * Hook for managing user's roaster preferences
 * Handles fetching, creating, updating, and tracking roaster usage
 * 
 * @param userId - Current user's ID (optional, no-op if not logged in)
 * @returns Query state and mutation functions
 */
export function useRoasterPreferences(userId?: string) {
  const queryClient = useQueryClient();
  
  // Fetch user's roaster preferences
  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ['roaster-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_roaster_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      return data as UserRoasterPreference[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Get primary roaster (user's default)
  const primaryRoaster = preferences?.find(p => p.is_primary);
  
  // Get most recently used roaster
  const lastUsedRoaster = preferences?.length
    ? [...preferences].sort((a, b) => 
        new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime()
      )[0]
    : undefined;
  
  // Get most frequently used roaster
  const mostUsedRoaster = preferences?.length
    ? [...preferences].sort((a, b) => b.usage_count - a.usage_count)[0]
    : undefined;
  
  /**
   * Add or update roaster preference
   * Creates new preference if user doesn't have this roaster yet
   */
  const addRoasterMutation = useMutation({
    mutationFn: async (roasterType: RoasterType) => {
      if (!userId) throw new Error('User not logged in');
      
      // Check if preference already exists
      const existing = preferences?.find(p => p.roaster_type === roasterType);
      
      if (existing) {
        // Update existing preference
        const { data, error } = await supabase
          .from('user_roaster_preferences')
          .update({
            last_used_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new preference
        const { data, error } = await supabase
          .from('user_roaster_preferences')
          .insert({
            user_id: userId,
            roaster_type: roasterType,
            usage_count: 0,
            last_used_at: new Date().toISOString(),
            is_primary: preferences?.length === 0 // First roaster becomes primary
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roaster-preferences', userId] });
    }
  });
  
  /**
   * Increment usage count for a roaster
   * Called when user completes a roast with this roaster
   */
  const incrementUsageMutation = useMutation({
    mutationFn: async (roasterType: RoasterType) => {
      if (!userId) throw new Error('User not logged in');
      
      const preference = preferences?.find(p => p.roaster_type === roasterType);
      
      if (!preference) {
        // Create preference if it doesn't exist
        return addRoasterMutation.mutateAsync(roasterType);
      }
      
      // Increment usage count and update last_used_at
      const { error } = await supabase
        .from('user_roaster_preferences')
        .update({
          usage_count: preference.usage_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', preference.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roaster-preferences', userId] });
    }
  });
  
  /**
   * Set a roaster as the user's primary/default roaster
   * Only one roaster can be primary at a time
   */
  const setPrimaryMutation = useMutation({
    mutationFn: async (roasterType: RoasterType) => {
      if (!userId) throw new Error('User not logged in');
      
      // First, set all roasters to non-primary
      await supabase
        .from('user_roaster_preferences')
        .update({ is_primary: false })
        .eq('user_id', userId);
      
      // Then set the selected roaster as primary
      const { error } = await supabase
        .from('user_roaster_preferences')
        .update({ is_primary: true })
        .eq('user_id', userId)
        .eq('roaster_type', roasterType);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roaster-preferences', userId] });
    }
  });
  
  /**
   * Remove a roaster from user's preferences
   */
  const removeRoasterMutation = useMutation({
    mutationFn: async (roasterType: RoasterType) => {
      if (!userId) throw new Error('User not logged in');
      
      const { error } = await supabase
        .from('user_roaster_preferences')
        .delete()
        .eq('user_id', userId)
        .eq('roaster_type', roasterType);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roaster-preferences', userId] });
    }
  });
  
  return {
    // Query state
    preferences,
    primaryRoaster,
    lastUsedRoaster,
    mostUsedRoaster,
    isLoading,
    error,
    
    // Mutations
    addRoaster: addRoasterMutation.mutate,
    addRoasterAsync: addRoasterMutation.mutateAsync,
    incrementUsage: incrementUsageMutation.mutate,
    incrementUsageAsync: incrementUsageMutation.mutateAsync,
    setPrimary: setPrimaryMutation.mutate,
    setPrimaryAsync: setPrimaryMutation.mutateAsync,
    removeRoaster: removeRoasterMutation.mutate,
    removeRoasterAsync: removeRoasterMutation.mutateAsync,
    
    // Mutation states
    isAddingRoaster: addRoasterMutation.isPending,
    isSettingPrimary: setPrimaryMutation.isPending,
  };
}
