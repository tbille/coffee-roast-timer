import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { useProfileComparison } from '@/hooks/useProfileComparison';
import { ProfileCard } from './ProfileCard';
import { ComparisonChart } from './ComparisonChart';
import { ComparisonStats } from './ComparisonStats';
import { ProfileSelector } from './ProfileSelector';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
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
    console.error('Profile comparison error:', error);
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load profiles for comparison: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const comparisonProfile1 = profiles?.[0];
  const comparisonProfile2 = profiles?.[1];

  // Extract statistics from comparison profiles
  const stats1 = comparisonProfile1?.statistics || null;
  const stats2 = comparisonProfile2?.statistics || null;

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
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
            {comparisonProfile1 && (
              <ProfileCard 
                comparisonProfile={comparisonProfile1} 
                onRemove={() => handleRemoveProfile(comparisonProfile1.profile.id)}
              />
            )}
            {comparisonProfile2 && (
              <ProfileCard 
                comparisonProfile={comparisonProfile2} 
                onRemove={() => handleRemoveProfile(comparisonProfile2.profile.id)}
              />
            )}
            {comparisonProfile1 && !comparisonProfile2 && (
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
          {comparisonProfile1 && (
            <div className="mb-6">
              <ComparisonChart profiles={profiles || []} />
            </div>
          )}

          {/* Statistics Comparison */}
          {stats1 && (
            <ComparisonStats
              stats={[stats1, stats2]}
              profileNames={[comparisonProfile1?.profile.beans_name || 'Profile 1', comparisonProfile2?.profile.beans_name || null]}
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
    </>
  );
};
