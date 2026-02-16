import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, MapPin, Scale, Copy, ThumbsUp } from 'lucide-react';
import { getRoasterBadgeClasses } from '@/utils/roasterColors';
import { ROASTER_SPECS } from '@/utils/roasterRegistry';
import type { RoasterType } from '@/types/roaster.types';

interface RoastProfile {
  id: string;
  user_id: string;
  beans_name: string;
  origin?: string;
  farm_name?: string;
  roast_process?: string;
  coffee_roaster?: string;
  initial_weight?: number;
  final_weight?: number;
  duration_seconds: number;
  temperature_data: any;
  crack_events: any;
  created_at: string;
  likes_count: number;
  roaster_type?: RoasterType;
}

export function LatestRoasts() {
  const navigate = useNavigate();

  // Helper functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getWeightLoss = (initial?: number, final?: number): string => {
    if (!initial || !final) return "N/A";
    const loss = initial - final;
    const percentage = (loss / initial) * 100;
    return `${loss.toFixed(1)}g (${percentage.toFixed(1)}%)`;
  };

  const getRoasterDisplayName = (roasterType?: RoasterType): string => {
    if (!roasterType) return "Unknown";
    const roaster = ROASTER_SPECS[roasterType];
    return roaster ? `${roaster.manufacturer} ${roaster.name}` : roasterType;
  };

  const handleUseAsReference = (profile: RoastProfile, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Fetch latest 4 roasts
  const { data: roasts, isLoading } = useQuery({
    queryKey: ['latest-roasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roast_profiles')
        .select(`
          *,
          likes:roast_profile_likes(count)
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      
      // Transform the data to include likes_count
      return (data || []).map(profile => ({
        ...profile,
        likes_count: profile.likes?.[0]?.count || 0
      })) as RoastProfile[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 px-4 bg-muted/20">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading latest roasts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!roasts || roasts.length === 0) {
    return null; // Don't show section if no roasts
  }

  return (
    <section className="py-12 px-4 bg-muted/20">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Latest Roasts</h2>
            <p className="text-muted-foreground">Fresh from the community</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/discover')}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Horizontal scrolling lane */}
        <div className="overflow-x-auto -mx-4 px-4 pb-4">
          <div className="flex gap-4 sm:gap-6 min-w-min">
            {roasts.map((profile) => (
              <Card
                key={profile.id}
                className="w-[280px] sm:w-[320px] flex-shrink-0 shadow-coffee hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/profile/${profile.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {profile.beans_name}
                        </CardTitle>
                        {profile.roaster_type && (
                          <Badge className={`text-xs ${getRoasterBadgeClasses(profile.roaster_type)}`}>
                            {getRoasterDisplayName(profile.roaster_type)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{profile.likes_count}</span>
                      </div>
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
                  
                  {profile.coffee_roaster && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Roaster:</strong> {profile.coffee_roaster}
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
                      onClick={(e) => handleUseAsReference(profile, e)}
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
        </div>

        {/* Hint for mobile scroll */}
        <div className="text-center mt-4 md:hidden">
          <p className="text-xs text-muted-foreground">← Swipe to see more →</p>
        </div>
      </div>
    </section>
  );
}
