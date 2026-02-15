import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoastProfile } from '@/types/roast.types';
import { format } from 'date-fns';
import { Coffee } from 'lucide-react';

interface CuppingNotesCardProps {
  profile: RoastProfile;
  onEdit: () => void;
  isOwner: boolean;
}

export function CuppingNotesCard({ profile, onEdit, isOwner }: CuppingNotesCardProps) {
  const hasCuppingData = profile.cupping_score || profile.flavor_notes || profile.flavor_tags?.length;

  if (!hasCuppingData) {
    return (
      <Card className="shadow-coffee">
        <CardHeader>
          <CardTitle className="flex justify-between items-center" as="h2">
            Tasting Notes
            {isOwner && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Add Notes
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            {isOwner 
              ? "No tasting notes yet. Cup your roast and record how it tastes!"
              : "No tasting notes available for this roast."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-coffee">
      <CardHeader>
        <CardTitle className="flex justify-between items-center" as="h2">
          Tasting Notes
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cupping Score */}
        {profile.cupping_score !== undefined && profile.cupping_score !== null && (
          <div>
            <div className="text-2xl font-semibold text-gray-700">
              {profile.cupping_score}/100
            </div>
            {profile.cupping_date && (
              <div className="text-sm text-gray-500 mt-1">
                Cupped on {format(new Date(profile.cupping_date), 'MMM d, yyyy')}
                {profile.rest_days !== undefined && profile.rest_days !== null && ` • ${profile.rest_days} days rest`}
              </div>
            )}
          </div>
        )}

        {/* Photo */}
        {profile.roasted_bean_photo_url && (
          <div className="relative">
            <img
              src={profile.roasted_bean_photo_url}
              alt="Roasted beans"
              className="w-full max-w-md rounded-lg border"
            />
          </div>
        )}

        {/* Flavor Tags */}
        {profile.flavor_tags && profile.flavor_tags.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">
              Flavor Profile:
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.flavor_tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="bg-amber-100 text-amber-800"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Brew Method */}
        {profile.brew_method && (
          <div className="flex items-center gap-2 text-sm">
            <Coffee className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500">Brew Method: </span>
            <span className="font-medium text-gray-700">{profile.brew_method}</span>
          </div>
        )}

        {/* Tasting Notes */}
        {profile.flavor_notes && (
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Notes:</div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {profile.flavor_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
