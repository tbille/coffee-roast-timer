import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RoasterSelectorCTA } from './RoasterSelectorCTA';
import { Badge } from '@/components/ui/badge';
import { Coffee, Users, BarChart3 } from 'lucide-react';

export function HeroSection() {
  // Fetch actual roast count from database
  const { data: roastCount } = useQuery({
    queryKey: ['roast-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('roast_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching roast count:', error);
        return 0;
      }
      return count || 0;
    },
  });

  // Format the count for display
  const formatCount = (count: number | undefined) => {
    if (!count) return '0';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    return `${count}+`;
  };

  return (
    <section className="relative py-12 md:py-20 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-brown-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-brown-950/20 -z-10" />
      
      <div className="container max-w-6xl mx-auto">
        {/* Quick Stats Badge */}
        <div className="flex justify-center mb-8">
          <Badge variant="secondary" className="px-4 py-2 text-sm gap-2">
            <Coffee className="h-4 w-4" />
            <span>6 Roasters Supported</span>
            <span className="text-muted-foreground">•</span>
            <Users className="h-4 w-4" />
            <span>{formatCount(roastCount)} Roasts Tracked</span>
          </Badge>
        </div>

        {/* Main Headline */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Perfect Your Coffee Roast,
            <br />
            <span className="text-primary">One Timer at a Time</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your roasts with precision. Learn from community profiles.
            Replicate your best batches every time.
          </p>
        </div>

        {/* CTA Component */}
        <RoasterSelectorCTA />

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Coffee className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Track Every Detail</h3>
            <p className="text-sm text-muted-foreground">
              Timer, temps, cracks, notes. All roaster types supported.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Learn from Community</h3>
            <p className="text-sm text-muted-foreground">
              Browse profiles. See what works.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Perfect Your Roast</h3>
            <p className="text-sm text-muted-foreground">
              Compare roasts, track dev time, dial it in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
