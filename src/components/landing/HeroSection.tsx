import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RoasterSelectorCTA } from './RoasterSelectorCTA';
import { RoastPreview } from './RoastPreview';
import { Badge } from '@/components/ui/badge';
import { Coffee, Users, BarChart3 } from 'lucide-react';

// Below this, a "roasts tracked" figure reads as weak social proof, so we hide it.
const MIN_ROAST_COUNT_TO_SHOW = 500;

const formatCount = (count: number) =>
  count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : `${count}+`;

const FEATURES = [
  {
    icon: Coffee,
    title: 'Log every event',
    text: 'Mark first crack, second crack and temperatures as they happen. Notes and weights save with the roast.',
  },
  {
    icon: Users,
    title: 'Borrow what works',
    text: 'See first-crack and drop times from people roasting on the same machine as you.',
  },
  {
    icon: BarChart3,
    title: 'Repeat your best batch',
    text: 'Compare roasts side by side and watch your development ratio to dial in a profile.',
  },
];

export function HeroSection() {
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

  const showRoastCount = (roastCount ?? 0) >= MIN_ROAST_COUNT_TO_SHOW;

  return (
    <section className="relative py-12 md:py-20 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-50/50 via-orange-50/30 to-brown-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-brown-950/20 -z-10" />

      <div className="container max-w-6xl mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            {/* Quick Stats Badge */}
            <div className="hidden md:flex justify-center lg:justify-start mb-6">
              <Badge variant="secondary" className="px-4 py-2 text-sm gap-2">
                <Coffee className="h-4 w-4" />
                <span>Gene Cafe, Behmor, FreshRoast, KALDI, Hottop &amp; popcorn poppers</span>
                {showRoastCount && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span>{formatCount(roastCount!)} roasts tracked</span>
                  </>
                )}
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="text-center lg:text-left space-y-4 mb-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Perfect Your Coffee Roast,
                <br />
                <span className="text-primary">One Timer at a Time</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Track your roasts with precision. Learn from community profiles.
                Replicate your best batches every time.
              </p>
            </div>

            <RoasterSelectorCTA />
          </div>

          <RoastPreview />
        </div>

        {/* Feature Highlights */}
        <h2 className="sr-only">Feature Highlights</h2>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
