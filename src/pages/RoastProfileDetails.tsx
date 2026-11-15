import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Flame, GitCompare, Pencil, Share2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CuppingNotesForm } from "@/components/cupping/CuppingNotesForm";
import { RoastSummary } from "@/components/profile/RoastSummary";
import { RoastCurveChart } from "@/components/profile/RoastCurveChart";
import { RoastSteps } from "@/components/profile/RoastSteps";
import { RoastNotes } from "@/components/profile/RoastNotes";
import { RoastSetup } from "@/components/profile/RoastSetup";
import { EditDetailsDialog, type EditableDetails } from "@/components/profile/EditDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import { getTemperatureGraphContextNote } from "@/utils/roasterDisplay";
import type { TemperatureUnit } from "@/utils/temperatureConversion";
import {
  checkBatchSize,
  deriveChartPoints,
  deriveRoastFacts,
  deriveRoastPhases,
  deriveRoastSteps,
  roasterName,
} from "@/utils/roastProfileView";
import type { RoasterType } from "@/types/roaster.types";
import type { RoastProfile } from "@/types/roast.types";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["roast_profiles"]["Update"];

type ProfileRow = RoastProfile & { roaster_data: Record<string, unknown> | null };

const RoastProfileDetails = () => {
  const { id } = useParams<{ id: string }>();
  const canonicalUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}`
    : `https://roast-timer.com/profile/${id ?? ""}`;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCuppingForm, setShowCuppingForm] = useState(false);
  const [viewUnit, setViewUnit] = useState<TemperatureUnit>("C");

  const { data: likesData } = useQuery({
    queryKey: ["roast-profile-likes", id, user?.id],
    queryFn: async () => {
      if (!id) return { count: 0, userHasLiked: false };
      const { data: likes, error } = await supabase
        .from("roast_profile_likes")
        .select("user_id")
        .eq("roast_profile_id", id);
      if (error) throw error;
      return {
        count: likes?.length || 0,
        userHasLiked: user ? likes?.some((like) => like.user_id === user.id) || false : false,
      };
    },
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: async ({ action }: { action: "like" | "unlike" }) => {
      if (!user || !id) throw new Error("User not authenticated");
      const { error } = action === "like"
        ? await supabase.from("roast_profile_likes").insert({ user_id: user.id, roast_profile_id: id })
        : await supabase.from("roast_profile_likes").delete().eq("user_id", user.id).eq("roast_profile_id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roast-profile-likes", id] }),
    onError: () => toast({ title: "Error", description: "Failed to update like status.", variant: "destructive" }),
  });

  const handleLikeClick = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    likeMutation.mutate({ action: likesData?.userHasLiked ? "unlike" : "like" });
  };

  useEffect(() => {
    if (!id) return;
    fetchProfile();
    if (user) fetchUserPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchUserPreferences = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("default_temperature_unit")
      .eq("id", user?.id)
      .single();
    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user preferences:", error);
      return;
    }
    if (data?.default_temperature_unit) setViewUnit(data.default_temperature_unit as TemperatureUnit);
  };

  const fetchProfile = async () => {
    if (!id) return;
    try {
      const { data: roastData, error: roastError } = await supabase
        .from("roast_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (roastError) throw roastError;
      if (!roastData) {
        setProfile(null);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", roastData.user_id)
        .maybeSingle();

      setProfile({
        ...(roastData as unknown as ProfileRow),
        temperature_data: Array.isArray(roastData.temperature_data) ? (roastData.temperature_data as unknown as RoastProfile["temperature_data"]) : [],
        crack_events: Array.isArray(roastData.crack_events) ? (roastData.crack_events as unknown as RoastProfile["crack_events"]) : [],
        profiles: profileData ? { username: profileData.username ?? undefined } : undefined,
        temperature_unit: (roastData.temperature_unit || "C") as TemperatureUnit,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ title: "Error", description: "Failed to load roast profile.", variant: "destructive" });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = !!user && user.id === profile?.user_id;

  const updateProfile = async (patch: ProfileUpdate, successTitle: string): Promise<boolean> => {
    if (!profile || !isOwner) return false;
    const { error } = await supabase.from("roast_profiles").update(patch).eq("id", profile.id);
    if (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: "Your changes could not be saved.", variant: "destructive" });
      return false;
    }
    setProfile({ ...profile, ...patch } as ProfileRow);
    toast({ title: successTitle });
    return true;
  };

  const handleSaveNotes = (notes: string) => updateProfile({ notes }, "Notes saved");

  const handleSaveDetails = (d: EditableDetails) =>
    updateProfile(
      {
        beans_name: d.beans_name.trim(),
        origin: d.origin || null,
        farm_name: d.farm_name || null,
        roast_process: d.roast_process || null,
        coffee_roaster: d.coffee_roaster || null,
        initial_weight: d.initial_weight || null,
        final_weight: d.final_weight || null,
      },
      "Roast details updated",
    );

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile?.beans_name} roast profile`, url: shareUrl });
        return;
      } catch {
        // Cancelled or unsupported: fall back to copying the link
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "Paste it anywhere to share this roast." });
    } catch {
      toast({ title: "Share this profile", description: shareUrl, duration: 10000 });
    }
  };

  const editableDetails = useMemo<EditableDetails>(() => ({
    beans_name: profile?.beans_name ?? "",
    origin: profile?.origin ?? "",
    farm_name: profile?.farm_name ?? "",
    roast_process: profile?.roast_process ?? "",
    coffee_roaster: profile?.coffee_roaster ?? "",
    initial_weight: profile?.initial_weight ?? 0,
    final_weight: profile?.final_weight ?? 0,
  }), [profile]);

  const view = useMemo(() => {
    if (!profile) return null;
    const facts = deriveRoastFacts(profile);
    return {
      facts,
      phases: deriveRoastPhases(profile, facts),
      steps: deriveRoastSteps(profile, facts, viewUnit),
      chartPoints: deriveChartPoints(profile, viewUnit),
      batchCheck: checkBatchSize(profile.roaster_type, facts.weightIn),
    };
  }, [profile, viewUnit]);

  const generatePageTitle = (): string => {
    if (!profile) return "Coffee Roast Profile";
    const username = profile.profiles?.username;
    return username ? `${profile.beans_name} - Coffee Roast by ${username}` : `${profile.beans_name} - Coffee Roast Profile`;
  };

  const generatePageDescription = (): string => {
    if (!profile) return "View detailed coffee roast profile with temperature curves and tasting notes.";
    const parts = [`Roast of ${profile.beans_name}`];
    if (profile.origin) parts.push(`from ${profile.origin}`);
    if (profile.farm_name) parts.push(`from ${profile.farm_name} farm`);
    if (profile.profiles?.username) parts.push(`by ${profile.profiles.username}`);
    let description = parts.join(" ");
    if (profile.roast_process) description += `. ${profile.roast_process} process`;
    description += ". View temperature curves, development data, and tasting notes.";
    return description.length > 160 ? `${description.substring(0, 157)}...` : description;
  };

  const relatedGuides = (() => {
    const defaultGuides = [
      { label: "First crack timing", path: "/how-to/first-crack-timing" },
      { label: "Development ratios", path: "/how-to/development-ratios" },
      { label: "Roast defect diagnosis", path: "/how-to/roast-defects" },
    ];
    switch (profile?.roaster_type) {
      case "behmor-2000ab":
        return [{ label: "Behmor troubleshooting", path: "/how-to/behmor-2000ab-troubleshooting" }, ...defaultGuides];
      case "popcorn-popper":
        return [{ label: "Popcorn popper safety", path: "/how-to/popcorn-popper-safety" }, ...defaultGuides];
      default:
        return defaultGuides;
    }
  })();

  if (loading) {
    return (
      <div className="bg-background px-4 py-6" aria-busy="true" aria-label="Loading roast profile">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!profile || !view) {
    return (
      <>
        <Helmet>
          <title>Roast Profile Not Found</title>
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
        <div className="bg-background px-4 py-16">
          <div className="mx-auto max-w-md space-y-4 text-center">
            <h1 className="text-2xl font-semibold">Roast profile not found</h1>
            <p className="text-muted-foreground">It may have been deleted, or the link is incomplete.</p>
            <div className="flex justify-center gap-2">
              <Button asChild><Link to="/discover">Browse roasts</Link></Button>
              <Button variant="outline" asChild><Link to="/">Home</Link></Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const generateJsonLd = () => ({
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: profile.beans_name,
    description: generatePageDescription(),
    author: { "@type": "Person", name: profile.profiles?.username || "Coffee Roaster" },
    datePublished: profile.created_at,
    dateModified: profile.updated_at || profile.created_at,
    recipeCategory: "Coffee Roasting",
    cookingMethod: "Coffee Roasting",
    recipeCuisine: "Coffee",
    keywords: ["coffee roasting", "coffee profile", profile.beans_name, profile.origin, profile.farm_name, "temperature curve"]
      .filter(Boolean)
      .join(", "),
    recipeIngredient: [
      `${profile.initial_weight ? `${profile.initial_weight}g ` : ""}${profile.beans_name} green coffee beans`,
      profile.origin && `Origin: ${profile.origin}`,
      profile.farm_name && `Farm: ${profile.farm_name}`,
    ].filter(Boolean),
    recipeInstructions: view.steps.map((step) => ({
      "@type": "HowToStep",
      text: [step.title, step.values?.join(", "), step.detail].filter(Boolean).join(": "),
    })),
    totalTime: `PT${Math.floor(profile.duration_seconds / 60)}M${profile.duration_seconds % 60}S`,
    recipeYield: profile.final_weight ? `${profile.final_weight}g roasted coffee` : "Roasted coffee beans",
  });

  const { facts, phases, steps, chartPoints, batchCheck } = view;
  const roasterType = profile.roaster_type as RoasterType | undefined;
  const spec = roasterType ? ROASTER_SPECS[roasterType] : undefined;
  const displayRoaster = roasterName(roasterType, profile.coffee_roaster);
  const roastLink = roasterType && spec ? `/roast?roaster=${roasterType}` : "/roast";
  const roastLabel = spec ? `Roast this on ${spec.displayName}` : "Start a roast";
  const subtitle = [profile.origin, profile.roast_process, displayRoaster].filter(Boolean).join(" · ");
  const roastedOn = new Date(profile.created_at);
  const beanPoints = chartPoints.filter((p) => p.bean !== undefined).length;
  const showChart = beanPoints >= 3;
  const liked = likesData?.userHasLiked ?? false;
  const likeCount = likesData?.count ?? 0;

  const roastCta = (
    <Button asChild size="lg" className="w-full sm:w-auto">
      <Link to={roastLink}>
        <Flame />
        {roastLabel}
      </Link>
    </Button>
  );

  return (
    <>
      <Helmet>
        <title>{generatePageTitle()}</title>
        <meta name="description" content={generatePageDescription()} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content={profile.profiles?.username || "Coffee Roaster"} />
        <meta
          name="keywords"
          content={["coffee roasting", "coffee profile", profile.beans_name, profile.origin, profile.farm_name, "temperature curve", "coffee development", "roast analysis"]
            .filter(Boolean)
            .join(", ")}
        />
        <meta property="og:title" content={generatePageTitle()} />
        <meta property="og:description" content={generatePageDescription()} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Roast Timer - Coffee Roasting Profiles" />
        <meta property="og:locale" content="en_US" />
        <meta property="article:published_time" content={profile.created_at} />
        <meta property="article:modified_time" content={profile.updated_at || profile.created_at} />
        {profile.profiles?.username && <meta property="article:author" content={profile.profiles.username} />}
        <meta property="article:section" content="Coffee Roasting" />
        <meta property="article:tag" content="coffee roasting" />
        {profile.origin && <meta property="article:tag" content={profile.origin} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@roasttimer" />
        <meta name="twitter:title" content={generatePageTitle()} />
        <meta name="twitter:description" content={generatePageDescription()} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(generateJsonLd())}</script>
      </Helmet>

      <div className="overflow-x-hidden bg-background px-4 py-6 sm:py-8">
        <article className="mx-auto w-full max-w-4xl space-y-6">
          {/* Header */}
          <header className="space-y-4">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <li><Link to="/discover" className="hover:text-foreground hover:underline">Discover</Link></li>
                {spec && (
                  <>
                    <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
                    <li>
                      <Link to={`/discover?roaster=${roasterType}`} className="hover:text-foreground hover:underline">
                        {spec.displayName}
                      </Link>
                    </li>
                  </>
                )}
              </ol>
            </nav>

            <div className="space-y-2">
              <h1 className="wrap-break-word text-2xl font-bold leading-tight text-foreground sm:text-4xl">{profile.beans_name}</h1>
              {subtitle && <p className="text-base text-foreground/80 sm:text-lg">{subtitle}</p>}
              <p className="text-sm text-muted-foreground">
                {profile.profiles?.username ? <>Roasted by <span className="font-medium text-foreground">{profile.profiles.username}</span> on </> : "Roasted on "}
                <time dateTime={profile.created_at}>
                  {roastedOn.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </time>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-full sm:w-auto">{roastCta}</div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLikeClick}
                disabled={likeMutation.isPending}
                aria-pressed={liked}
                aria-label={`${liked ? "Unlike" : "Like"} this roast, ${likeCount} ${likeCount === 1 ? "like" : "likes"}`}
                className="flex-1 sm:flex-none"
              >
                <ThumbsUp className={cn(liked && "fill-current")} />
                <span className="tabular-nums">{likeCount}</span>
              </Button>
              <Button variant="outline" size="lg" onClick={handleShare} className="flex-1 sm:flex-none">
                <Share2 />
                Share
              </Button>
              {isOwner && (
                <>
                  <Button variant="ghost" size="lg" onClick={() => setShowEditDialog(true)} className="flex-1 sm:flex-none">
                    <Pencil />
                    Edit
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => navigate(`/compare?ids=${id}`)} className="flex-1 sm:flex-none">
                    <GitCompare />
                    Compare
                  </Button>
                </>
              )}
            </div>
          </header>

          <RoastSummary facts={facts} phases={phases} />

          <RoastNotes
            data={profile}
            isOwner={isOwner}
            onSaveNotes={handleSaveNotes}
            onEditCupping={() => setShowCuppingForm(true)}
          />

          {showChart && (
            <RoastCurveChart
              points={chartPoints}
              facts={facts}
              unit={viewUnit}
              onUnitChange={setViewUnit}
              contextNote={roasterType ? getTemperatureGraphContextNote(roasterType) : null}
            />
          )}

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <RoastSteps
              steps={steps}
              footer={
                <div className="flex flex-col items-start gap-3">
                  <p className="text-sm text-muted-foreground">Want to try it? The timer opens set up for this roaster.</p>
                  {roastCta}
                </div>
              }
            />
            <RoastSetup
              origin={profile.origin}
              farm={profile.farm_name}
              process={profile.roast_process}
              roaster={displayRoaster}
              manufacturer={spec?.manufacturer}
              weightIn={facts.weightIn}
              weightOut={facts.weightOut}
              batchCheck={batchCheck}
              startingConditions={profile.roaster_settings?.starting_conditions}
              environmentalNotes={profile.environmental_notes}
              instructions={profile.roaster_settings?.instructions}
            />
          </div>

          <Card>
            <CardContent className="space-y-2 p-4 sm:p-6">
              <h2 className="text-base font-semibold">Keep exploring</h2>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <li>
                  <Link to={roasterType ? `/discover?roaster=${roasterType}` : "/discover"} className="text-primary underline-offset-4 hover:underline">
                    {spec ? `More ${spec.displayName} roasts` : "More community roasts"}
                  </Link>
                </li>
                {relatedGuides.map((guide) => (
                  <li key={guide.path}>
                    <Link to={guide.path} className="text-primary underline-offset-4 hover:underline">{guide.label}</Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </article>

        {isOwner && (
          <>
            <EditDetailsDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              initial={editableDetails}
              showRoasterField={!spec}
              onSave={handleSaveDetails}
            />
            <CuppingNotesForm
              profile={profile}
              open={showCuppingForm}
              onOpenChange={(open) => {
                setShowCuppingForm(open);
                if (!open) fetchProfile();
              }}
            />
          </>
        )}

        <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign in to like roasts</AlertDialogTitle>
              <AlertDialogDescription>
                Create a free account or sign in to like roast profiles and keep track of your favorites.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setShowAuthDialog(false)}>Cancel</Button>
              <AlertDialogAction onClick={() => navigate("/auth")}>Sign in or create account</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default RoastProfileDetails;
