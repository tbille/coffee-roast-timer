import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ComparisonProfile } from '@/types/comparison.types';
import { format } from 'date-fns';
import { formatDuration } from '@/utils/roastStatistics';
import { useNavigate } from 'react-router-dom';

interface ProfileCardProps {
  comparisonProfile: ComparisonProfile;
  onRemove: () => void;
}

export function ProfileCard({ comparisonProfile, onRemove }: ProfileCardProps) {
  const { profile, color } = comparisonProfile;
  const navigate = useNavigate();

  return (
    <Card 
      className="relative cursor-pointer hover:shadow-md transition-shadow"
      style={{ borderLeftWidth: '4px', borderLeftColor: color }}
      onClick={() => navigate(`/profile/${profile.id}`)}
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-destructive/10"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="Remove profile from comparison"
      >
        <X className="h-4 w-4" />
      </Button>

      <CardContent className="pt-6 pb-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg pr-8 truncate">
            {profile.beans_name}
          </h3>
          
          {profile.origin && (
            <p className="text-sm text-muted-foreground">
              {profile.origin}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{format(new Date(profile.created_at), 'MMM d, yyyy')}</span>
            <span>•</span>
            <span>{formatDuration(profile.duration_seconds)}</span>
          </div>

          {profile.profiles?.username && (
            <p className="text-xs text-muted-foreground">
              by {profile.profiles.username}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
