import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Heart, Clock, Weight, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import type { RoastProfile } from '@/types/roast.types';
import { getRoasterSpec } from '@/utils/roasterRegistry';
import { formatDuration } from '@/utils/roastStatistics';

export function FeaturedProfilesCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch featured profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['featured-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roast_profiles')
        .select(`
          *,
          likes:roast_profile_likes(count)
        `)
        .not('roasted_bean_photo_url', 'is', null)
        .not('cupping_score', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Sort by likes and recent activity
      const sortedProfiles = (data || []).sort((a, b) => {
        const likesA = a.likes?.[0]?.count || 0;
        const likesB = b.likes?.[0]?.count || 0;
        if (likesA !== likesB) return likesB - likesA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      return sortedProfiles.slice(0, 12) as unknown as RoastProfile[];
    },
  });

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || !profiles || profiles.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, profiles]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + (profiles?.length || 0)) % (profiles?.length || 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % (profiles?.length || 1));
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  const handleUseAsReference = (profile: RoastProfile) => {
    navigate('/roast', { 
      state: { 
        roasterType: profile.roaster_type,
        referenceProfileId: profile.id 
      } 
    });
  };

  if (isLoading || !profiles || profiles.length === 0) {
    return (
      <section className="py-12 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading featured roasts...</p>
          </div>
        </div>
      </section>
    );
  }

  // Calculate visible profiles (show 3 on desktop, 1 on mobile)
  const visibleCount = 3;
  const visibleProfiles = [];
  for (let i = 0; i < visibleCount; i++) {
    const index = (currentIndex + i) % profiles.length;
    visibleProfiles.push(profiles[index]);
  }

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Latest Roasts from the Community</h2>
            <p className="text-muted-foreground">Get inspired by real roasters sharing their profiles</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/discover')}>
            View All Profiles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex"
            onClick={handlePrevious}
            aria-label="Previous featured profiles"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex"
            onClick={handleNext}
            aria-label="Next featured profiles"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleProfiles.map((profile, idx) => {
              const roasterSpec = getRoasterSpec(profile.roaster_type);
              const weightLoss = profile.initial_weight && profile.final_weight
                ? ((profile.initial_weight - profile.final_weight) / profile.initial_weight * 100).toFixed(1)
                : null;

              return (
                <Card 
                  key={`${profile.id}-${idx}`} 
                  className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                  onClick={() => handleViewProfile(profile.id)}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                  {/* Bean Photo */}
                  {profile.roasted_bean_photo_url && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={profile.roasted_bean_photo_url}
                        alt={profile.beans_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {profile.cupping_score && (
                        <Badge className="absolute top-3 right-3 bg-amber-500/90 text-white">
                          ⭐ {profile.cupping_score}/100
                        </Badge>
                      )}
                    </div>
                  )}

                  <CardContent className="p-6 space-y-4">
                    {/* Bean Info */}
                    <div>
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{profile.beans_name}</h3>
                      {profile.origin && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{profile.origin}</p>
                      )}
                    </div>

                    {/* Roaster Badge */}
                    <Badge variant="outline" className="w-fit">
                      {roasterSpec.displayName}
                    </Badge>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDuration(profile.duration_seconds)}</span>
                      </div>
                      {weightLoss && (
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-muted-foreground" />
                          <span>{weightLoss}% loss</span>
                        </div>
                      )}
                      {profile.development_stats?.development_ratio_percent && (
                        <div className="flex items-center gap-2 col-span-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.development_stats.development_ratio_percent.toFixed(1)}% dev ratio</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseAsReference(profile);
                        }}
                      >
                        Use as Reference
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {profiles.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                }`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsAutoPlaying(false);
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
