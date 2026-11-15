import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coffee, Users } from 'lucide-react';
import { ROASTER_SPECS } from '@/utils/roasterRegistry';
import { saveRoasterPreference } from '@/utils/roasterPreferences';
import type { RoasterType } from '@/types/roaster.types';

export function RoasterShowcase() {
  const navigate = useNavigate();

  const handleStartWithRoaster = (roasterType: RoasterType) => {
    saveRoasterPreference(roasterType);
    navigate('/roast', { state: { roasterType } });
  };

  // Only show these 6 supported roasters on the homepage
  const supportedRoasterIds: RoasterType[] = [
    'popcorn-popper',
    'gene-cbr-101',
    'behmor-2000ab',
    'freshroast-sr800',
    'kaldi-wide',
    'hottop-kn8828'
  ];

  // Filter and sort roasters by the specified order
  const sortedRoasters = supportedRoasterIds
    .map(id => ROASTER_SPECS[id])
    .filter(Boolean); // Filter out any undefined specs

  return (
    <section className="py-16 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Roast with Confidence on Any Machine</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We support 6 popular coffee roasters with custom interfaces designed for each machine
          </p>
        </div>

        {/* Roaster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {sortedRoasters.map((roaster) => {
            const isPopular = (roaster.communitySize || 0) > 2000;
            
            return (
              <Card 
                key={roaster.id}
                className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
                onClick={() => handleStartWithRoaster(roaster.id)}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Icon */}
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Coffee className="h-6 w-6 text-primary" />
                    </div>
                    {isPopular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>

                  {/* Roaster Info */}
                  <div>
                    <h3 className="font-bold text-lg mb-1 line-clamp-2 min-h-14">
                      {roaster.displayName}
                    </h3>
                    {roaster.manufacturer && (
                      <p className="text-sm text-muted-foreground">{roaster.manufacturer}</p>
                    )}
                  </div>

                  {/* Control Type Badge */}
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {roaster.controlType === 'dual-temperature' && 'Dual Temp'}
                      {roaster.controlType === 'profile-based' && 'Profile Based'}
                      {roaster.controlType === 'heat-fan-control' && 'Heat/Fan Control'}
                      {roaster.controlType === 'manual-simple' && 'Manual Control'}
                    </Badge>
                  </div>

                  {/* Hidden button - shows on hover */}
                  <Button 
                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                    variant="outline"
                    size="sm"
                  >
                    Start Timer
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Don't see your roaster? We support custom configurations too!
          </p>
          <Button variant="link" asChild>
            <Link to="/how-to/getting-started">Learn more about custom roaster setups →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
