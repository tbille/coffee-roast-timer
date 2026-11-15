import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface Profile {
  id: string;
  beans_name: string;
  origin?: string;
  coffee_roaster?: string;
  created_at: string;
  duration_seconds: number;
  user_id: string;
  profiles?: {
    username?: string;
  };
}

interface ProfileSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSelect: (profileIds: string[]) => void;
  excludeId?: string; // Exclude current profile when comparing from details page
}

export const ProfileSelector = ({
  open,
  onOpenChange,
  selectedIds,
  onSelect,
  excludeId,
}: ProfileSelectorProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProfiles(
        profiles.filter(
          (p) =>
            p.beans_name.toLowerCase().includes(query) ||
            p.origin?.toLowerCase().includes(query) ||
            p.coffee_roaster?.toLowerCase().includes(query) ||
            p.profiles?.username?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, profiles]);

  const fetchProfiles = async () => {
    setLoading(true);

    try {
      // First, fetch roast profiles
      const { data: roastData, error: roastError } = await supabase
        .from('roast_profiles')
        .select('id, beans_name, origin, coffee_roaster, created_at, duration_seconds, user_id')
        .order('created_at', { ascending: false });

      if (roastError) {
        console.error('Supabase error fetching profiles:', roastError);
        throw roastError;
      }

      console.log('Fetched roast profiles:', roastData?.length || 0);

      if (!roastData || roastData.length === 0) {
        setProfiles([]);
        setFilteredProfiles([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(roastData.map(p => p.user_id))];
      
      // Fetch usernames for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Could not fetch usernames:', profilesError);
        // Continue without usernames
      }

      // Create a map of user_id to username
      const usernameMap = new Map(
        (profilesData || []).map(p => [p.id, p.username])
      );

      // Combine the data
      const combined = roastData.map(profile => ({
        ...profile,
        profiles: {
          username: usernameMap.get(profile.user_id)
        }
      }));

      // Filter out excluded profile if provided
      const filtered = excludeId
        ? combined.filter((p) => p.id !== excludeId)
        : combined;

      setProfiles(filtered);
      setFilteredProfiles(filtered);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: `Failed to load profiles: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProfile = (profileId: string) => {
    if (selectedIds.includes(profileId)) {
      onSelect(selectedIds.filter((id) => id !== profileId));
    } else {
      if (selectedIds.length >= 2) {
        toast({
          title: 'Maximum Reached',
          description: 'You can compare up to 2 profiles at a time.',
        });
        return;
      }
      onSelect([...selectedIds, profileId]);
    }
  };

  const handleCompare = () => {
    if (selectedIds.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one profile to compare.',
      });
      return;
    }
    onOpenChange(false);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by beans, origin, roaster, or user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selection Count */}
      <div className="mb-3 text-sm text-muted-foreground">
        {selectedIds.length} of 2 profiles selected
      </div>

      {/* Profile List */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading profiles...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No profiles found matching your search.' : 'No profiles available.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProfiles.map((profile) => {
              const isSelected = selectedIds.includes(profile.id);
              return (
                <Card
                  key={profile.id}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary border-2 bg-primary/5'
                      : 'border hover:border-primary/50'
                  }`}
                  onClick={() => toggleProfile(profile.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{profile.beans_name}</h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {profile.profiles?.username && (
                          <span className="font-medium">by {profile.profiles.username}</span>
                        )}
                        {profile.origin && <span>{profile.origin}</span>}
                        {profile.coffee_roaster && <span>{profile.coffee_roaster}</span>}
                        <span>{formatDuration(profile.duration_seconds)}</span>
                        <span>{formatDate(profile.created_at)}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="ml-2 shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {selectedIds.indexOf(profile.id) + 1}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleCompare}
          disabled={selectedIds.length === 0}
          className="flex-1"
        >
          Compare {selectedIds.length > 0 && `(${selectedIds.length})`}
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Profiles to Compare</DialogTitle>
            <DialogDescription>
              Choose up to 2 profiles from any user to compare side by side.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Select Profiles to Compare</DrawerTitle>
          <DrawerDescription>
            Choose up to 2 profiles from any user to compare side by side.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex-1 overflow-hidden pb-4">{content}</div>
      </DrawerContent>
    </Drawer>
  );
};
