import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Coffee, MapPin, Scale, Search, Copy, ThumbsUp } from "lucide-react";

interface RoastProfile {
  id: string;
  user_id: string;
  beans_name: string;
  origin?: string;
  farm_name?: string;
  roast_process?: string;
  initial_weight?: number;
  final_weight?: number;
  duration_seconds: number;
  temperature_data: any;
  crack_events: any;
  created_at: string;
  likes_count: number;
}

const Discover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<RoastProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<RoastProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchQuery, profiles]);

  const fetchProfiles = async () => {
    try {
      // First fetch all roast profiles
      const { data: roastData, error: roastError } = await supabase
        .from('roast_profiles')
        .select('*');

      if (roastError) throw roastError;

      // Then fetch likes count for each profile
      const profilesWithLikes = await Promise.all(
        (roastData || []).map(async (profile) => {
          const { data: likesData, error: likesError } = await supabase
            .from('roast_profile_likes')
            .select('id')
            .eq('roast_profile_id', profile.id);

          // Don't throw error if likes query fails, just set count to 0
          const likes_count = likesError ? 0 : (likesData?.length || 0);

          return {
            ...profile,
            likes_count
          };
        })
      );

      // Sort by likes first (descending), then by date (newest first)
      const sortedProfiles = profilesWithLikes.sort((a, b) => {
        if (a.likes_count !== b.likes_count) {
          return b.likes_count - a.likes_count; // More likes first
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Newer first
      });

      setProfiles(sortedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load roast profiles.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = profiles.filter(profile => 
      profile.beans_name.toLowerCase().includes(query) ||
      profile.origin?.toLowerCase().includes(query) ||
      profile.farm_name?.toLowerCase().includes(query) ||
      profile.roast_process?.toLowerCase().includes(query)
    );
    
    setFilteredProfiles(filtered);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeightLoss = (initial?: number, final?: number): string => {
    if (!initial || !final) return "N/A";
    const loss = initial - final;
    const percentage = (loss / initial) * 100;
    return `${loss.toFixed(1)}g (${percentage.toFixed(1)}%)`;
  };

  const handleUseAsReference = (profile: RoastProfile) => {
    navigate('/', { 
      state: { 
        referenceProfile: {
          beans_name: profile.beans_name,
          origin: profile.origin,
          farm_name: profile.farm_name,
          roast_process: profile.roast_process,
          initial_weight: profile.initial_weight,
          temperature_data: profile.temperature_data
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-2 sm:p-4 overflow-x-hidden">
        <div className="container mx-auto max-w-6xl w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-lg text-foreground">Loading profiles...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-2 sm:p-4 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center">Discover Roast Profiles</h1>
          <div className="flex justify-center mt-2">
            <Badge variant="secondary" className="text-xs">
              {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <Card className="shadow-coffee mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by bean name, origin, farm, or process..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <Card className="shadow-coffee">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery ? "No profiles found" : "No roast profiles yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms to find more profiles."
                    : "Be the first to share a roast profile!"
                  }
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProfiles.map((profile) => (
              <Card 
                key={profile.id} 
                className="shadow-coffee hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/profile/${profile.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {profile.beans_name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{profile.likes_count}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatDate(profile.created_at)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.origin || "Unknown origin"}</span>
                  </div>
                  
                  {profile.farm_name && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Farm:</strong> {profile.farm_name}
                    </div>
                  )}
                  
                  {profile.roast_process && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Process:</strong> {profile.roast_process}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(profile.duration_seconds)}</span>
                    </div>
                    {profile.initial_weight && profile.final_weight && (
                      <div className="flex items-center gap-1">
                        <Scale className="h-4 w-4" />
                        <span>{getWeightLoss(profile.initial_weight, profile.final_weight)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseAsReference(profile);
                      }}
                      className="w-full flex items-center gap-2 text-xs"
                    >
                      <Copy className="h-3 w-3" />
                      Use as Reference
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;