import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Coffee, Users, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CommunityStats() {
  const navigate = useNavigate();

  // Fetch real stats from database
  const { data: stats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const [roastsResult, profilesResult, usersResult] = await Promise.all([
        supabase.from('roast_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('roast_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalRoasts: roastsResult.count || 0,
        totalProfiles: profilesResult.count || 0,
        totalUsers: usersResult.count || 0,
      };
    },
  });

  // Animated counter effect
  const [displayRoasts, setDisplayRoasts] = useState(0);
  const [displayProfiles, setDisplayProfiles] = useState(0);
  const [displayUsers, setDisplayUsers] = useState(0);

  useEffect(() => {
    if (!stats) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setDisplayRoasts(Math.floor(stats.totalRoasts * progress));
      setDisplayProfiles(Math.floor(stats.totalProfiles * progress));
      setDisplayUsers(Math.floor(stats.totalUsers * progress));

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayRoasts(stats.totalRoasts);
        setDisplayProfiles(stats.totalProfiles);
        setDisplayUsers(stats.totalUsers);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
      <div className="container max-w-4xl mx-auto text-center space-y-8">
        {/* Heading */}
        <div>
          <h2 className="text-4xl font-bold mb-3">
            Join Thousands of Home Roasters Perfecting Their Craft
          </h2>
          <p className="text-lg text-muted-foreground">
            Track, learn, and improve with our growing community
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Coffee className="h-8 w-8 text-primary" />
            </div>
            <div className="text-4xl font-bold text-primary">
              {formatNumber(displayRoasts)}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Roasts Tracked
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="text-4xl font-bold text-primary">
              {formatNumber(displayProfiles)}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Profiles Shared
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="text-4xl font-bold text-primary">
              {formatNumber(displayUsers)}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Home Roasters
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" onClick={() => navigate('/discover')} className="text-lg">
            Explore All Profiles
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg">
            Sign Up Free
          </Button>
        </div>
      </div>
    </section>
  );
}
