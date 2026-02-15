import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProfileComparison } from '@/hooks/useProfileComparison';
import { calculateProfileStatistics } from '@/utils/roastStatistics';
import { ProfileCard } from './ProfileCard';
import { ComparisonChart } from './ComparisonChart';
import { ComparisonStats } from './ComparisonStats';
import { ProfileSelector } from './ProfileSelector';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ComparisonPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Get profile IDs from URL params
  const profileIdsParam = searchParams.get('ids');
  const profileIds = profileIdsParam ? profileIdsParam.split(',').filter(Boolean) : [];

  // Fetch comparison data
  const { data: profiles, isLoading, error } = useProfileComparison(profileIds);

  // Open selector if no profiles selected
  useEffect(() => {
    if (!isLoading && profileIds.length === 0) {
      setSelectorOpen(true);
    }
  }, [isLoading, profileIds.length]);

  const handleSelectProfiles = (newIds: string[]) => {
    if (newIds.length > 0) {
      setSearchParams({ ids: newIds.join(',') });
    } else {
      setSearchParams({});
    }
  };

  const handleRemoveProfile = (profileId: string) => {
    const newIds = profileIds.filter((id) => id !== profileId);
    if (newIds.length > 0) {
      setSearchParams({ ids: newIds.join(',') });
    } else {
      setSearchParams({});
      setSelectorOpen(true);
    }
  };

  const handleAddProfile = () => {
    if (profileIds.length >= 2) return;
    setSelectorOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center text-muted-foreground">Loading comparison...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load profiles for comparison. Please try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const profile1 = profiles?.[0];
  const profile2 = profiles?.[1];

  // Calculate statistics for both profiles
  const stats1 = profile1 ? calculateProfileStatistics(profile1) : null;
  const stats2 = profile2 ? calculateProfileStatistics(profile2) : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Profile Comparison</h1>
            <p className="text-sm text-muted-foreground">
              Compare roast profiles side by side
            </p>
          </div>
        </div>
        {profileIds.length < 2 && (
          <Button onClick={handleAddProfile} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Profile
          </Button>
        )}
      </div>

      {/* Profile Cards */}
      {profileIds.length === 0 ? (
        <Alert className="mb-6">
          <AlertDescription>
            No profiles selected. Please select profiles to compare.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Profile Cards - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {profile1 && (
              <div className="relative">
                <ProfileCard profile={profile1} colorIndex={0} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleRemoveProfile(profile1.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {profile2 && (
              <div className="relative">
                <ProfileCard profile={profile2} colorIndex={1} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleRemoveProfile(profile2.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {profile1 && !profile2 && (
              <Button
                variant="outline"
                className="h-full min-h-[200px] border-dashed"
                onClick={handleAddProfile}
              >
                <Plus className="h-6 w-6 mr-2" />
                Add Profile to Compare
              </Button>
            )}
          </div>

          {/* Temperature Chart */}
          {profile1 && (
            <div className="mb-6">
              <ComparisonChart profiles={profiles || []} />
            </div>
          )}

          {/* Statistics Comparison */}
          {stats1 && (
            <ComparisonStats
              stats={[stats1, stats2]}
              profileNames={[profile1?.beans_name || 'Profile 1', profile2?.beans_name || null]}
            />
          )}
        </>
      )}

      {/* Profile Selector Modal */}
      <ProfileSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        selectedIds={profileIds}
        onSelect={handleSelectProfiles}
      />
    </div>
  );
};
