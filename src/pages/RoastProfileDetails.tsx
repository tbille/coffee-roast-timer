import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, GitCompare, Pencil, Repeat2, Share2, ThumbsUp, Trash2 } from "lucide-react";
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
import { PageTitle, pageTitle } from "@/components/PageTitle";
import { CuppingNotesForm } from "@/components/cupping/CuppingNotesForm";
import { RoastSummary } from "@/components/profile/RoastSummary";
import { RoastCurveChart } from "@/components/profile/RoastCurveChart";
import { RoastSteps } from "@/components/profile/RoastSteps";
import { RoastNotes } from "@/components/profile/RoastNotes";
import { RoastSetup } from "@/components/profile/RoastSetup";
import { EditDetailsDialog, type EditableDetails } from "@/components/profile/EditDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import { getTemperatureGraphContextNote } from "@/utils/roasterDisplay";
import type { TemperatureUnit } from "@/utils/temperatureConversion";
import {
  checkBatchSize,
  countBeanReadings,
  deriveChartPoints,
  deriveEventMarks,
  deriveRoastFacts,
  deriveRoastPhases,
  deriveRoastSteps,
  isLegacyLevel,
  isSchemaV2,
  originLabel,
  placeLabel,
  processLabel,
  roastLevelLabel,
  roasterName,
} from "@/utils/roastProfileView";
import { tidyLabel } from "@/utils/textDisplay";
import type { RoasterType } from "@/types/roaster.types";
import { PROCESS_LABELS } from "@/types/roast-session.types";
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
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCuppingForm, setShowCuppingForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    onError: () => toast.error("Your like could not be saved."),
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
      toast.error("This roast could not be loaded.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = !!user && user.id === profile?.user_id;

  // "Ready to taste" links land on /profile/:id#notes: scroll to the tasting notes,
  // and open the tasting form for the owner when nothing is recorded yet.
  const location = useLocation();
  const scrolledToNotes = useRef(false);
  const openedTasting = useRef(false);
  useEffect(() => {
    if (loading || !profile || location.hash !== "#notes") return;
    if (!scrolledToNotes.current) {
      scrolledToNotes.current = true;
      requestAnimationFrame(() => document.getElementById("notes")?.scrollIntoView({ block: "start" }));
    }
    if (isOwner && !openedTasting.current && profile.cupping_score == null) {
      openedTasting.current = true;
      setShowCuppingForm(true);
    }
  }, [loading, profile, location.hash, isOwner]);

  const updateProfile = async (patch: ProfileUpdate, successTitle: string): Promise<boolean> => {
    if (!profile || !isOwner) return false;
    const { error } = await supabase.from("roast_profiles").update(patch).eq("id", profile.id);
    if (error) {
      console.error("Error updating profile:", error);
      toast.error("Your changes could not be saved.");
      return false;
    }
    setProfile({ ...profile, ...patch } as ProfileRow);
    toast.success(successTitle);
    return true;
  };

  const handleSaveNotes = (notes: string) => updateProfile({ notes }, "Notes saved");

  const handleSaveDetails = (d: EditableDetails) => {
    // Keep a v2 process key in sync with the edited text, so the page shows what was typed
    const settings = (profile?.roaster_settings ?? null) as Record<string, unknown> | null;
    let roasterSettingsPatch: Pick<ProfileUpdate, "roaster_settings"> = {};
    if (settings && typeof settings.process === "string") {
      const next = { ...settings };
      const typed = d.roast_process.trim().toLowerCase();
      const key = Object.entries(PROCESS_LABELS).find(([, label]) => label.toLowerCase() === typed)?.[0];
      if (key) next.process = key;
      else delete next.process;
      roasterSettingsPatch = { roaster_settings: next as ProfileUpdate["roaster_settings"] };
    }
    return updateProfile(
      {
        ...roasterSettingsPatch,
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
  };

  const handleDelete = async () => {
    if (!profile || !isOwner) return;
    setDeleting(true);
    const { error } = await supabase.from("roast_profiles").delete().eq("id", profile.id);
    setDeleting(false);
    if (error) {
      console.error("Error deleting roast:", error);
      toast.error("This roast could not be deleted.");
      return;
    }
    setShowDeleteDialog(false);
    queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
    toast.success("Roast deleted");
    navigate("/roasts");
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile?.beans_name} roast`, url: shareUrl });
        return;
      } catch {
        // Cancelled or unsupported: fall back to copying the link
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied", { description: "Paste it anywhere to share this roast." });
    } catch {
      toast.message("Share this roast", { description: shareUrl, duration: 10000 });
    }
  };

  const editableDetails = useMemo<EditableDetails>(() => ({
    beans_name: profile?.beans_name ?? "",
    origin: profile?.origin ?? "",
    farm_name: profile?.farm_name ?? "",
    roast_process: (profile && processLabel(profile)) ?? profile?.roast_process ?? "",
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
      marks: deriveEventMarks(profile, facts),
      steps: deriveRoastSteps(profile, facts, viewUnit),
      chartPoints: deriveChartPoints(profile, viewUnit),
      batchCheck: checkBatchSize(profile.roaster_type, facts.weightIn),
      origin: originLabel(profile.origin),
      process: processLabel(profile),
      level: roastLevelLabel(profile),
      levelIsLegacy: isLegacyLevel(profile),
      place: placeLabel(profile, viewUnit),
      beanName: tidyLabel(profile.beans_name) || "Untitled roast",
      isV2: isSchemaV2(profile),
    };
  }, [profile, viewUnit]);

  const generatePageTitle = (): string => {
    if (!profile) return "Coffee roast";
    const username = profile.profiles?.username;
    return username ? `${view?.beanName ?? profile.beans_name} roast by ${username}` : `${view?.beanName ?? profile.beans_name} roast`;
  };

  const generatePageDescription = (): string => {
    if (!profile) return "A home coffee roast with first crack timing, development and tasting notes.";
    const parts = [`Roast of ${view?.beanName ?? profile.beans_name}`];
    if (view?.origin) parts.push(`from ${view.origin}`);
    if (profile.farm_name) parts.push(`(${tidyLabel(profile.farm_name)})`);
    if (profile.profiles?.username) parts.push(`by ${profile.profiles.username}`);
    let description = parts.join(" ");
    if (view?.process) description += `. ${view.process} process`;
    if (view?.level && !view.levelIsLegacy) description += `, ${view.level} roast`;
    description += ". First crack, development, weight loss and the steps to roast it again.";
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
          <title>{pageTitle("Roast not found")}</title>
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
        <div className="bg-background px-4 py-16">
          <div className="mx-auto max-w-md space-y-4 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Roast not found</h1>
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
    name: view.beanName,
    description: generatePageDescription(),
    author: { "@type": "Person", name: profile.profiles?.username || "Coffee Roaster" },
    datePublished: profile.created_at,
    dateModified: profile.updated_at || profile.created_at,
    recipeCategory: "Coffee Roasting",
    cookingMethod: "Coffee Roasting",
    recipeCuisine: "Coffee",
    keywords: ["coffee roasting", "roast profile", view.beanName, view.origin, profile.farm_name]
      .filter(Boolean)
      .join(", "),
    recipeIngredient: [
      `${profile.initial_weight ? `${profile.initial_weight}g ` : ""}${profile.beans_name} green coffee beans`,
      view.origin && `Origin: ${view.origin}`,
      profile.farm_name && `Farm: ${profile.farm_name}`,
    ].filter(Boolean),
    recipeInstructions: view.steps.map((step) => ({
      "@type": "HowToStep",
      text: [step.title, step.values?.join(", "), step.detail].filter(Boolean).join(": "),
    })),
    totalTime: `PT${Math.floor(profile.duration_seconds / 60)}M${profile.duration_seconds % 60}S`,
    recipeYield: profile.final_weight ? `${profile.final_weight}g roasted coffee` : "Roasted coffee beans",
  });

  const { facts, phases, marks, steps, chartPoints, batchCheck } = view;
  const roasterType = profile.roaster_type as RoasterType | undefined;
  const spec = roasterType ? ROASTER_SPECS[roasterType] : undefined;
  const displayRoaster = roasterName(roasterType, profile.coffee_roaster);
  const roastAgainLink = spec ? `/roast?roaster=${roasterType}&ref=${profile.id}` : `/roast?ref=${profile.id}`;
  const subtitle = [view.origin, view.process, view.level, displayRoaster].filter(Boolean).join(" · ");
  const showChart = countBeanReadings(chartPoints) >= 3;
  const liked = likesData?.userHasLiked ?? false;
  const likeCount = likesData?.count ?? 0;
  // Environment notes written by the post-roast card repeat the "Where" row; hide the duplicate.
  const envNotes = profile.environmental_notes?.trim();
  const placeFirst = view.place?.split(" · ")[0]?.toLowerCase();
  const showEnvNotes = envNotes && !(placeFirst && envNotes.toLowerCase().startsWith(placeFirst) && envNotes.length <= 60);

  const roastAgain = (
    <div className="flex flex-col items-start gap-1.5">
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link to={roastAgainLink}>
          <Repeat2 strokeWidth={1.75} aria-hidden />
          Roast again
        </Link>
      </Button>
      <p className="text-xs text-muted-foreground">Opens the timer with this roast as a live reference</p>
    </div>
  );

  return (
    <>
      <PageTitle title={view.beanName} description={generatePageDescription()} />
      <Helmet>
        <meta name="robots" content="index, follow" />
        <meta name="author" content={profile.profiles?.username || "Coffee roaster"} />
        <meta
          name="keywords"
          content={["coffee roasting", "roast profile", view.beanName, view.origin, profile.farm_name, displayRoaster, "first crack", "development"]
            .filter(Boolean)
            .join(", ")}
        />
        <meta property="og:title" content={generatePageTitle()} />
        <meta property="og:description" content={generatePageDescription()} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Roast Timer" />
        <meta property="og:locale" content="en_US" />
        <meta property="article:published_time" content={profile.created_at} />
        <meta property="article:modified_time" content={profile.updated_at || profile.created_at} />
        {profile.profiles?.username && <meta property="article:author" content={profile.profiles.username} />}
        <meta property="article:section" content="Coffee Roasting" />
        <meta property="article:tag" content="coffee roasting" />
        {view.origin && <meta property="article:tag" content={view.origin} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@roasttimer" />
        <meta name="twitter:title" content={generatePageTitle()} />
        <meta name="twitter:description" content={generatePageDescription()} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(generateJsonLd())}</script>
      </Helmet>

      <div className="overflow-x-hidden bg-background px-4 py-6 sm:px-6 sm:py-8">
        <article className="mx-auto w-full max-w-4xl space-y-6">
          {/* Header */}
          <header className="space-y-5">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <li><Link to="/discover" className="hover:text-foreground hover:underline">Discover</Link></li>
                {spec && (
                  <>
                    <li aria-hidden><ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} /></li>
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
              <h1 className="wrap-break-word text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">{view.beanName}</h1>
              {subtitle && <p className="text-base text-muted-foreground sm:text-lg">{subtitle}</p>}
              <p className="text-sm text-muted-foreground">
                {profile.profiles?.username ? <>Roasted by <span className="font-medium text-foreground">{profile.profiles.username}</span> on </> : "Roasted on "}
                <time dateTime={profile.created_at}>{formatDate(profile.created_at)}</time>
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
              {roastAgain}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLikeClick}
                  disabled={likeMutation.isPending}
                  aria-pressed={liked}
                  aria-label={`${liked ? "Unlike" : "Like"} this roast, ${likeCount} ${likeCount === 1 ? "like" : "likes"}`}
                >
                  <ThumbsUp className={cn(liked && "fill-current")} strokeWidth={1.75} aria-hidden />
                  <span className="font-mono tabular-nums">{likeCount}</span>
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 strokeWidth={1.75} aria-hidden />
                  Share
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link to={`/compare?a=${profile.id}`}>
                    <GitCompare strokeWidth={1.75} aria-hidden />
                    Compare
                  </Link>
                </Button>
                {isOwner && (
                  <>
                    <Button variant="ghost" size="lg" onClick={() => setShowEditDialog(true)}>
                      <Pencil strokeWidth={1.75} aria-hidden />
                      Edit details
                    </Button>
                    <Button variant="ghost" size="lg" onClick={() => setShowDeleteDialog(true)} className="text-destructive hover:text-destructive">
                      <Trash2 strokeWidth={1.75} aria-hidden />
                      Delete
                    </Button>
                  </>
                )}
              </div>
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
              marks={marks}
              unit={viewUnit}
              onUnitChange={setViewUnit}
              contextNote={roasterType ? getTemperatureGraphContextNote(roasterType) : null}
            />
          )}

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <RoastSteps
              steps={steps}
              footer={roastAgain}
            />
            <RoastSetup
              origin={view.origin}
              farm={tidyLabel(profile.farm_name)}
              process={view.process}
              level={view.level}
              levelIsLegacy={view.levelIsLegacy}
              place={view.place}
              roaster={displayRoaster}
              manufacturer={spec?.manufacturer}
              weightIn={facts.weightIn}
              weightOut={facts.weightOut}
              batchCheck={batchCheck}
              startingConditions={view.isV2 ? undefined : profile.roaster_settings?.starting_conditions}
              environmentalNotes={showEnvNotes ? envNotes : undefined}
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

        {isOwner && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this roast?</AlertDialogTitle>
                <AlertDialogDescription>
                  {view.beanName} and its tasting notes will be removed for good. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting…" : "Delete roast"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign in to like roasts</AlertDialogTitle>
              <AlertDialogDescription>
                Create a free account or sign in to like roasts and keep track of your favourites.
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
