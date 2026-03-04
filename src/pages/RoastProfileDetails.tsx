import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea } from "recharts";
import { Edit, Save, X, Copy, Thermometer } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { convertTemperature, type TemperatureUnit } from "@/utils/temperatureConversion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CuppingNotesCard } from "@/components/cupping/CuppingNotesCard";
import { CuppingNotesForm } from "@/components/cupping/CuppingNotesForm";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import { getRoasterBadgeClasses } from "@/utils/roasterColors";
import type { RoasterType } from "@/types/roaster.types";
import { RoasterSettingsDisplay } from "@/components/roast/RoasterSettingsDisplay";
import { VerticalRoastTimeline } from "@/components/roast/VerticalRoastTimeline";
import { CompactStatsBadges } from "@/components/roast/CompactStatsBadges";
import { ProfileActionsMenu } from "@/components/roast/ProfileActionsMenu";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { calculateDevelopmentStats } from "@/utils/developmentCalculations";
import { enrichProfileWithGuidance } from "@/utils/migrateExistingProfiles";
import { getTemperatureGraphContextNote, shouldShowTemperatureGraphByDefault } from "@/utils/roasterDisplay";
import type { RoastProfile as RoastProfileType, RoasterSettings, RoastMilestone, DevelopmentStats } from "@/types/roast.types";

interface RoastData {
  time: number;
  targetTemp: number;
  currentTemp: number;
}

interface CrackEvent {
  time: number;
  targetTemp: number;
  currentTemp: number;
  type: 'first' | 'second';
}

interface RoastProfile {
  id: string;
  user_id: string;
  beans_name: string;
  origin?: string;
  farm_name?: string;
  roast_process?: string;
  initial_weight?: number;
  final_weight?: number;
  duration_seconds: number;
  temperature_data: RoastData[];
  crack_events: CrackEvent[];
  notes?: string;
  created_at: string;
  profiles?: {
    username?: string;
  };
  coffee_roaster?: string;
  temperature_unit?: TemperatureUnit;
  environmental_notes?: string;
  roaster_type?: RoasterType;
  roaster_settings?: RoasterSettings;
  milestones?: RoastMilestone[];
  development_stats?: DevelopmentStats;
}

const RoastProfileDetails = () => {
  const { id } = useParams<{ id: string }>();
  const canonicalUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}`
    : `https://roast-timer.com/profile/${id ?? ""}`;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [profile, setProfile] = useState<RoastProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState({
    beans_name: "",
    origin: "",
    farm_name: "",
    roast_process: "",
    coffee_roaster: "",
    initial_weight: 0,
    final_weight: 0
  });
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [viewUnit, setViewUnit] = useState<TemperatureUnit>('C');
  const [userDefaultUnit, setUserDefaultUnit] = useState<TemperatureUnit>('C');
  const [showCuppingForm, setShowCuppingForm] = useState(false);
  const [showTemperatureGraph, setShowTemperatureGraph] = useState(true);

  // Fetch likes count and user's like status
  const { data: likesData } = useQuery({
    queryKey: ['roast-profile-likes', id],
    queryFn: async () => {
      if (!id) return { count: 0, userHasLiked: false };
      
      const { data: likes, error } = await supabase
        .from('roast_profile_likes')
        .select('user_id')
        .eq('roast_profile_id', id);

      if (error) throw error;

      const count = likes?.length || 0;
      const userHasLiked = user ? likes?.some(like => like.user_id === user.id) || false : false;

      return { count, userHasLiked };
    },
    enabled: !!id,
  });

  // Mutation for toggling likes
  const likeMutation = useMutation({
    mutationFn: async ({ action }: { action: 'like' | 'unlike' }) => {
      if (!user || !id) throw new Error('User not authenticated');

      if (action === 'like') {
        const { error } = await supabase
          .from('roast_profile_likes')
          .insert({ user_id: user.id, roast_profile_id: id });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('roast_profile_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('roast_profile_id', id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roast-profile-likes', id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive"
      });
    }
  });

  const handleLikeClick = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    const action = likesData?.userHasLiked ? 'unlike' : 'like';
    likeMutation.mutate({ action });
  };

  useEffect(() => {
    if (!id) return;
    fetchProfile();
    if (user) {
      fetchUserPreferences();
    }
  }, [id, user]);

  // Initialize temperature graph visibility based on roaster type
  useEffect(() => {
    if (profile?.roaster_type) {
      const hasTemperatureData = profile.temperature_data && profile.temperature_data.length > 0;
      const showByDefault = shouldShowTemperatureGraphByDefault(profile.roaster_type, hasTemperatureData);
      setShowTemperatureGraph(showByDefault);
    }
  }, [profile?.roaster_type]);

  const fetchUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('default_temperature_unit')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user preferences:', error);
        return;
      }

      const defaultUnit = data?.default_temperature_unit || 'C';
      setUserDefaultUnit(defaultUnit as TemperatureUnit);
      setViewUnit(defaultUnit as TemperatureUnit);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const fetchProfile = async () => {
    if (!id) return;
    try {
      // First get the roast profile
      const { data: roastData, error: roastError } = await supabase
        .from('roast_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (roastError) throw roastError;
      if (!roastData) {
        setProfile(null);
        return;
      }

      // Then get the profile data for the user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', roastData.user_id)
        .maybeSingle();

      // Don't throw error if profile doesn't exist, just continue without username
      if (profileError) {
        console.warn('Profile not found for user:', roastData.user_id);
      }
      
      // Parse the JSON data from Supabase
      const processedProfile: RoastProfile = {
        ...roastData,
        temperature_data: Array.isArray(roastData.temperature_data) ? roastData.temperature_data as unknown as RoastData[] : [],
        crack_events: Array.isArray(roastData.crack_events) ? roastData.crack_events as unknown as CrackEvent[] : [],
        profiles: profileData ? { username: profileData.username } : undefined,
        temperature_unit: (roastData.temperature_unit || 'C') as TemperatureUnit
      };
      
      // Enrich profile with replication guidance if missing (for backward compatibility)
      const enrichedProfile = enrichProfileWithGuidance(processedProfile);
      
      setProfile(enrichedProfile);
      setNotes(processedProfile.notes || "");
      setEditedMetadata({
        beans_name: processedProfile.beans_name,
        origin: processedProfile.origin || "",
        farm_name: processedProfile.farm_name || "",
        roast_process: processedProfile.roast_process || "",
        coffee_roaster: processedProfile.coffee_roaster || "",
        initial_weight: processedProfile.initial_weight || 0,
        final_weight: processedProfile.final_weight || 0
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load roast profile.",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is the owner
  const isOwner = user?.id === profile?.user_id;

  const handleSaveNotes = async () => {
    if (!profile || !isOwner) return;
    
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('roast_profiles')
        .update({ notes })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, notes });
      setIsEditingNotes(false);
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully."
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes.",
        variant: "destructive"
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!profile || !isOwner) return;
    
    setSavingMetadata(true);
    try {
      const { error } = await supabase
        .from('roast_profiles')
        .update({
          beans_name: editedMetadata.beans_name,
          origin: editedMetadata.origin || null,
          farm_name: editedMetadata.farm_name || null,
          roast_process: editedMetadata.roast_process || null,
          coffee_roaster: editedMetadata.coffee_roaster || null,
          initial_weight: editedMetadata.initial_weight || null,
          final_weight: editedMetadata.final_weight || null
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ 
        ...profile, 
        beans_name: editedMetadata.beans_name,
        origin: editedMetadata.origin || undefined,
        farm_name: editedMetadata.farm_name || undefined,
        roast_process: editedMetadata.roast_process || undefined,
        coffee_roaster: editedMetadata.coffee_roaster || undefined,
        initial_weight: editedMetadata.initial_weight || undefined,
        final_weight: editedMetadata.final_weight || undefined
      });
      setIsEditingMetadata(false);
      toast({
        title: "Metadata saved",
        description: "Your roast details have been updated successfully."
      });
    } catch (error) {
      console.error('Error saving metadata:', error);
      toast({
        title: "Error",
        description: "Failed to save metadata.",
        variant: "destructive"
      });
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleUseAsReference = () => {
    navigate('/', { 
      state: { 
        referenceProfile: {
          beans_name: profile?.beans_name,
          origin: profile?.origin,
          farm_name: profile?.farm_name,
          roast_process: profile?.roast_process,
          initial_weight: profile?.initial_weight,
          temperature_data: profile?.temperature_data
        }
      }
    });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `Check out this coffee roast profile: ${profile?.beans_name}`;
    
    // Try native share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${profile?.beans_name} - A coffee roast profile`,
          url: shareUrl,
        });
        return;
      } catch (error) {
        // User cancelled or error occurred, fall back to clipboard
      }
    }
    
    // Fallback to clipboard API
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Profile link copied to clipboard. Share it with your friends!",
      });
    } catch (error) {
      // Final fallback - show the URL in a toast
      toast({
        title: "Share this profile",
        description: shareUrl,
        duration: 10000,
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDevelopment = (): number => {
    if (!profile) return 0;
    const firstCrackEvent = profile.crack_events?.find(e => e.type === 'first');
    if (!firstCrackEvent || profile.duration_seconds === 0) return 0;
    return ((profile.duration_seconds - firstCrackEvent.time) / profile.duration_seconds * 100);
  };

  const calculateWeightLoss = (): number => {
    if (!profile?.initial_weight || !profile?.final_weight) return 0;
    return ((profile.initial_weight - profile.final_weight) / profile.initial_weight * 100);
  };

  const getRoasterDisplayName = (roasterType?: RoasterType): string => {
    if (!roasterType) return "Unknown";
    const roaster = ROASTER_SPECS[roasterType];
    return roaster ? `${roaster.manufacturer} ${roaster.name}` : roasterType;
  };

  const getRoasterDescription = (roasterType?: RoasterType): string | undefined => {
    if (!roasterType) return undefined;
    const roaster = ROASTER_SPECS[roasterType];
    if (!roaster) return undefined;
    return `${roaster.manufacturer} ${roaster.name}`;
  };

  const generatePageTitle = (): string => {
    if (!profile) return 'Coffee Roast Profile';
    
    const beansName = profile.beans_name;
    const username = profile.profiles?.username;
    
    if (username) {
      return `${beansName} - Coffee Roast by ${username}`;
    }
    
    return `${beansName} - Coffee Roast Profile`;
  };

  const generatePageDescription = (): string => {
    if (!profile) return 'View detailed coffee roast profile with temperature curves and tasting notes.';
    
    const parts = [];
    
    // Start with "Roast of [beans_name]"
    parts.push(`Roast of ${profile.beans_name}`);
    
    // Add origin if available
    if (profile.origin) {
      parts.push(`from ${profile.origin}`);
    }
    
    // Add farm if available
    if (profile.farm_name) {
      parts.push(`from ${profile.farm_name} farm`);
    }
    
    // Add username if available
    if (profile.profiles?.username) {
      parts.push(`by ${profile.profiles.username}`);
    }
    
    let description = parts.join(' ');
    
    // Add additional context
    if (profile.roast_process) {
      description += `. ${profile.roast_process} process`;
    }
    
    description += '. View temperature curves, development data, and tasting notes.';
    
    // Keep under 160 characters for SEO
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }
    
    return description;
  };

  const relatedGuides = (() => {
    const defaultGuides = [
      { label: "First crack timing", path: "/how-to/first-crack-timing" },
      { label: "Development ratios", path: "/how-to/development-ratios" },
      { label: "Roast defect diagnosis", path: "/how-to/roast-defects" }
    ];

    switch (profile?.roaster_type) {
      case "behmor-2000ab":
        return [
          { label: "Behmor troubleshooting", path: "/how-to/behmor-2000ab-troubleshooting" },
          ...defaultGuides
        ];
      case "popcorn-popper":
        return [
          { label: "Popcorn popper safety", path: "/how-to/popcorn-popper-safety" },
          ...defaultGuides
        ];
      default:
        return defaultGuides;
    }
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        <Helmet>
          <title>Roast Profile Not Found</title>
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
        <div className="bg-background p-2 sm:p-4 overflow-x-hidden">
          <div className="container mx-auto max-w-6xl w-full">
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="text-lg text-muted-foreground">Profile not found</div>
                <Button onClick={() => navigate('/')}>
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const generateJsonLd = () => {
    if (!profile) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "Recipe",
      "name": profile.beans_name,
      "description": generatePageDescription(),
      "author": {
        "@type": "Person",
        "name": profile.profiles?.username || "Coffee Roaster"
      },
      "datePublished": profile.created_at,
      "dateModified": profile.created_at,
      "recipeCategory": "Coffee Roasting",
      "cookingMethod": "Coffee Roasting",
      "recipeCuisine": "Coffee",
      "keywords": [
        "coffee roasting",
        "coffee profile",
        profile.beans_name,
        profile.origin,
        profile.farm_name,
        "temperature curve"
      ].filter(Boolean).join(", "),
      "recipeIngredient": [
        `${profile.initial_weight ? `${profile.initial_weight}g` : ''} ${profile.beans_name} coffee beans`,
        profile.origin && `Origin: ${profile.origin}`,
        profile.farm_name && `Farm: ${profile.farm_name}`
      ].filter(Boolean),
      "recipeInstructions": {
        "@type": "HowToStep",
        "text": `Roast ${profile.beans_name} beans for ${Math.floor(profile.duration_seconds / 60)} minutes following the temperature curve profile.`
      },
      "totalTime": `PT${Math.floor(profile.duration_seconds / 60)}M`,
      "recipeYield": profile.final_weight ? `${profile.final_weight}g roasted coffee` : "Roasted coffee beans",
      "aggregateRating": likesData?.count ? {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "ratingCount": likesData.count.toString()
      } : undefined
    };
  };

  return (
    <>
      <Helmet>
        <title>{generatePageTitle()}</title>
        <meta name="description" content={generatePageDescription()} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content={profile?.profiles?.username || 'Coffee Roaster'} />
        <meta name="keywords" content={[
          'coffee roasting',
          'coffee profile', 
          profile?.beans_name,
          profile?.origin,
          profile?.farm_name,
          'temperature curve',
          'coffee development',
          'roast analysis'
        ].filter(Boolean).join(', ')} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={generatePageTitle()} />
        <meta property="og:description" content={generatePageDescription()} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Roast Timer - Coffee Roasting Profiles" />
        <meta property="og:locale" content="en_US" />
        
        {/* Article-specific Open Graph */}
        {profile?.created_at && (
          <>
            <meta property="article:published_time" content={profile.created_at} />
            <meta property="article:modified_time" content={profile.created_at} />
          </>
        )}
        {profile?.profiles?.username && (
          <meta property="article:author" content={profile.profiles.username} />
        )}
        <meta property="article:section" content="Coffee Roasting" />
        <meta property="article:tag" content="coffee roasting" />
        {profile?.origin && <meta property="article:tag" content={profile.origin} />}
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@roasttimer" />
        <meta name="twitter:title" content={generatePageTitle()} />
        <meta name="twitter:description" content={generatePageDescription()} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* JSON-LD Structured Data */}
        {profile && (
          <script type="application/ld+json">
            {JSON.stringify(generateJsonLd())}
          </script>
        )}
      </Helmet>
      
      <div className="bg-background p-2 sm:p-4 overflow-x-hidden">
        <div className="container mx-auto max-w-6xl w-full">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-bold text-foreground break-words">{profile.beans_name}</h1>
              </div>
              {profile.profiles?.username && (
                <p className="text-sm text-muted-foreground mt-1">
                  by {profile.profiles.username}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ProfileActionsMenu
                userHasLiked={likesData?.userHasLiked || false}
                likesCount={likesData?.count || 0}
                onLike={handleLikeClick}
                onShare={handleShare}
                onCompare={isOwner ? () => navigate(`/compare?ids=${id}`) : undefined}
                onUseAsReference={handleUseAsReference}
                isOwner={isOwner}
                isLikePending={likeMutation.isPending}
              />
              <Badge variant="secondary" className="text-xs">
                {formatDate(profile.created_at)}
              </Badge>
            </div>
          </div>
          
          {/* Stats Badges Row */}
          <CompactStatsBadges
            durationSeconds={profile.duration_seconds}
            developmentPercent={calculateDevelopment()}
          />
        </div>

        {/* MAIN CONTENT: Single Column Layout */}
        <div className="space-y-6 w-full">
          {/* Roaster Settings Display */}
          {profile.roaster_type && (
            <RoasterSettingsDisplay
              roaster_type={profile.roaster_type}
              roaster_settings={profile.roaster_settings}
              development_stats={profile.development_stats || calculateDevelopmentStats(
                profile.duration_seconds,
                profile.milestones,
                profile.crack_events
              )}
              initial_weight={profile.initial_weight}
              final_weight={profile.final_weight}
              duration_seconds={profile.duration_seconds}
              beans_name={profile.beans_name}
              origin={profile.origin}
              farm_name={profile.farm_name}
              roast_process={profile.roast_process}
            />
          )}

          {/* Vertical Timeline with Integrated Sensory Checkpoints */}
          {profile.roaster_type && (
            <VerticalRoastTimeline
              duration_seconds={profile.duration_seconds}
              milestones={profile.milestones}
              roaster_settings={profile.roaster_settings}
            />
          )}

          {/* Edit Metadata Section - Only for owners */}
          {isOwner && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Edit Roast Details</h3>
                  {isEditingMetadata ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveMetadata}
                        disabled={savingMetadata}
                        className="flex items-center gap-2"
                        aria-label="Save roast details"
                      >
                        <Save className="h-4 w-4" />
                        {savingMetadata ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingMetadata(false);
                          setEditedMetadata({
                            beans_name: profile.beans_name,
                            origin: profile.origin || "",
                            farm_name: profile.farm_name || "",
                            roast_process: profile.roast_process || "",
                            coffee_roaster: profile.coffee_roaster || "",
                            initial_weight: profile.initial_weight || 0,
                            final_weight: profile.final_weight || 0
                          });
                        }}
                        className="flex items-center gap-2"
                        aria-label="Cancel editing roast details"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingMetadata(true)}
                      className="flex items-center gap-2"
                      aria-label="Edit roast details"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )
                }
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Bean Name</Label>
                    <Input
                      value={editedMetadata.beans_name}
                      onChange={(e) => setEditedMetadata({ ...editedMetadata, beans_name: e.target.value })}
                      placeholder="Bean name"
                      disabled={!isEditingMetadata}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Bean Origin</Label>
                    <Input
                      value={editedMetadata.origin}
                      onChange={(e) => setEditedMetadata({ ...editedMetadata, origin: e.target.value })}
                      placeholder="Origin (e.g., Ethiopia)"
                      disabled={!isEditingMetadata}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Farm</Label>
                    <Input
                      value={editedMetadata.farm_name}
                      onChange={(e) => setEditedMetadata({ ...editedMetadata, farm_name: e.target.value })}
                      placeholder="Farm name"
                      disabled={!isEditingMetadata}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Process</Label>
                    <Input
                      value={editedMetadata.roast_process}
                      onChange={(e) => setEditedMetadata({ ...editedMetadata, roast_process: e.target.value })}
                      placeholder="Processing method"
                      disabled={!isEditingMetadata}
                    />
                  </div>
                  
                  {!profile.roaster_type && (
                    <div>
                      <Label className="text-sm font-medium">Coffee Roaster</Label>
                      <Input
                        value={editedMetadata.coffee_roaster}
                        onChange={(e) => setEditedMetadata({ ...editedMetadata, coffee_roaster: e.target.value })}
                        placeholder="e.g., Gene CBR-101, Behmor 1600+"
                        disabled={!isEditingMetadata}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Initial Weight</Label>
                    <Input
                      type="number"
                      value={editedMetadata.initial_weight || ""}
                      onChange={(e) => setEditedMetadata({ ...editedMetadata, initial_weight: Number(e.target.value) || 0 })}
                      placeholder="Initial weight in grams"
                      disabled={!isEditingMetadata}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Final Weight</Label>
                    <Input
                      type="number"
                      value={editedMetadata.final_weight || ""}
                      onChange={(e) => setEditedMetadata({ ...editedMetadata, final_weight: Number(e.target.value) || 0 })}
                      placeholder="Final weight in grams"
                      disabled={!isEditingMetadata}
                    />
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* BOTTOM SECTION: Notes, Reference & Analysis (Full Width) */}
        <div className="space-y-6 mt-6">
            {/* Notes Section - For all users */}
            {(isOwner || profile.notes) && (
              isOwner ? (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Notes</h3>
                    {!isEditingNotes ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingNotes(true)}
                        className="flex items-center gap-2"
                        aria-label="Edit roast notes"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="flex items-center gap-2"
                          aria-label="Save roast notes"
                        >
                          <Save className="h-4 w-4" />
                          {savingNotes ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingNotes(false);
                            setNotes(profile.notes || "");
                          }}
                          className="flex items-center gap-2"
                          aria-label="Cancel editing roast notes"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  {isEditingNotes ? (
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this roast (taste notes, adjustments for next time, etc.)"
                      className="min-h-32"
                    />
                  ) : (
                    <div className="min-h-20">
                      {profile.notes ? (
                        <p className="text-sm whitespace-pre-wrap">{profile.notes}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No notes yet. Click Edit to add some!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <CollapsibleCard title="Notes" defaultOpen={false}>
                  <p className="text-sm whitespace-pre-wrap">{profile.notes}</p>
                </CollapsibleCard>
              )
            )}

            {/* Environmental Notes - Collapsible */}
            {profile.environmental_notes && (
              <CollapsibleCard title="Environmental Conditions" defaultOpen={false}>
                <p className="text-sm whitespace-pre-wrap">{profile.environmental_notes}</p>
              </CollapsibleCard>
            )}

            {/* Temperature Graph - Conditional based on roaster type, wrapped in CollapsibleCard */}
            {profile.roaster_type && (() => {
              const hasTemperatureData = profile.temperature_data && profile.temperature_data.length > 0;
              const showByDefault = shouldShowTemperatureGraphByDefault(profile.roaster_type, hasTemperatureData);
              const contextNote = getTemperatureGraphContextNote(profile.roaster_type);
              
              if (!hasTemperatureData) return null;
              
              return (
                <CollapsibleCard
                  title={
                    <div>
                      <div>Temperature Profile</div>
                      {contextNote && (
                        <p className="text-xs text-muted-foreground mt-1 font-normal leading-relaxed">
                          💡 {contextNote}
                        </p>
                      )}
                    </div>
                  }
                  defaultOpen={showByDefault}
                  headerActions={
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${viewUnit === 'C' ? 'font-medium' : 'text-muted-foreground'}`}>°C</span>
                        <Switch
                          checked={viewUnit === 'F'}
                          onCheckedChange={(checked) => setViewUnit(checked ? 'F' : 'C')}
                          aria-label="Toggle temperature unit between Celsius and Fahrenheit"
                        />
                        <span className={`text-sm ${viewUnit === 'F' ? 'font-medium' : 'text-muted-foreground'}`}>°F</span>
                      </div>
                    </div>
                  }
                >
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={profile.temperature_data.map(point => ({
                         ...point,
                         targetTemp: profile.temperature_unit === 'F' && viewUnit === 'C' 
                           ? convertTemperature(point.targetTemp, 'F', 'C')
                           : profile.temperature_unit === 'C' && viewUnit === 'F'
                           ? convertTemperature(point.targetTemp, 'C', 'F')
                           : point.targetTemp,
                         currentTemp: profile.temperature_unit === 'F' && viewUnit === 'C' 
                           ? convertTemperature(point.currentTemp, 'F', 'C')
                           : profile.temperature_unit === 'C' && viewUnit === 'F'
                           ? convertTemperature(point.currentTemp, 'C', 'F')
                           : point.currentTemp
                        }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        
                        {/* Phase shading backgrounds */}
                        {(() => {
                          const yellowingTime = profile.milestones?.find(m => m.event_type === 'yellowing')?.time_seconds;
                          const firstCrackTime = profile.milestones?.find(m => m.event_type === 'first_crack')?.time_seconds || 
                                                 profile.crack_events?.find(e => e.type === 'first')?.time;
                          
                          return (
                            <>
                              {/* Drying phase (0 to yellowing) - Light green */}
                              {yellowingTime && (
                                <ReferenceArea
                                  x1={0}
                                  x2={yellowingTime}
                                  fill="hsl(142 76% 36%)"
                                  fillOpacity={0.08}
                                  label={{ value: 'Drying', position: 'insideTop', fill: 'hsl(142 76% 36%)', fontSize: 11 }}
                                />
                              )}
                              
                              {/* Maillard phase (yellowing to first crack) - Yellow */}
                              {yellowingTime && firstCrackTime && (
                                <ReferenceArea
                                  x1={yellowingTime}
                                  x2={firstCrackTime}
                                  fill="hsl(48 96% 53%)"
                                  fillOpacity={0.08}
                                  label={{ value: 'Maillard', position: 'insideTop', fill: 'hsl(48 96% 53%)', fontSize: 11 }}
                                />
                              )}
                              
                              {/* Development phase (first crack to end) - Orange */}
                              {firstCrackTime && (
                                <ReferenceArea
                                  x1={firstCrackTime}
                                  x2={profile.duration_seconds}
                                  fill="hsl(24 95% 53%)"
                                  fillOpacity={0.08}
                                  label={{ value: 'Development', position: 'insideTop', fill: 'hsl(24 95% 53%)', fontSize: 11 }}
                                />
                              )}
                            </>
                          );
                        })()}
                        
                        <XAxis
                          dataKey="time" 
                          stroke="hsl(var(--foreground))" 
                          label={{
                            value: 'Time (MM:SS)',
                            position: 'insideBottom',
                            offset: -10
                          }}
                          tickFormatter={formatTime}
                        />
                        <YAxis 
                          stroke="hsl(var(--foreground))" 
                          label={{
                            value: `Temperature (°${viewUnit})`,
                            angle: -90,
                            position: 'insideLeft'
                          }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)"
                          }}
                          labelFormatter={(value) => `Time: ${formatTime(value as number)}`}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        
                        <Line 
                          type="monotone" 
                          dataKey="targetTemp" 
                          stroke="hsl(var(--temperature-hot))" 
                          strokeWidth={2} 
                          name="Target Temperature" 
                          strokeDasharray="5 5"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="currentTemp" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3} 
                          name="Current Temperature"
                        />
                        
                        {/* Crack events */}
                        {profile.crack_events?.map((crack, index) => (
                          <ReferenceLine
                            key={`${crack.type}-${index}`}
                            x={crack.time}
                            stroke={crack.type === 'first' ? "hsl(var(--destructive))" : "hsl(var(--warning))"}
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{
                              value: crack.type === 'first' ? 'First Crack' : 'Second Crack',
                              position: 'insideTopRight',
                              style: {
                                fontSize: '12px',
                                fill: crack.type === 'first' ? "hsl(var(--destructive))" : "hsl(var(--warning))"
                              }
                            }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CollapsibleCard>
              );
            })()}

            {/* Cupping & Tasting Notes */}
            <CuppingNotesCard 
              profile={profile}
              onEdit={() => setShowCuppingForm(true)}
              isOwner={isOwner}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Guides and Roasts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
                <Link
                  to={profile.roaster_type ? `/discover?roaster=${profile.roaster_type}` : "/discover"}
                  className="text-primary hover:underline"
                >
                  Similar community roasts
                </Link>
                {relatedGuides.map((guide) => (
                  <Link key={guide.path} to={guide.path} className="text-primary hover:underline">
                    {guide.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
        </div>
      </div>

      {/* Cupping Notes Form Dialog/Sheet */}
      {isOwner && (
        <CuppingNotesForm
          profile={profile}
          open={showCuppingForm}
          onOpenChange={setShowCuppingForm}
        />
      )}
      
      {/* Auth Dialog for Guest Users */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign in to like profiles</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be signed in to like roast profiles. Create an account or sign in to start liking profiles and save your favorites.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAuthDialog(false)}
              aria-label="Cancel sign in dialog"
            >
              Cancel
            </Button>
            <AlertDialogAction 
              onClick={() => navigate('/auth')}
              aria-label="Go to sign in page"
            >
              Sign in / Create Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  );
};

export default RoastProfileDetails;
