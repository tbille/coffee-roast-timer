import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Timer, BookOpen, Thermometer } from "lucide-react";

const HowTo = () => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://roast-timer.com"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "How To",
        item: "https://roast-timer.com/how-to"
      }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Coffee Roasting Guides",
    itemListElement: [
      "https://roast-timer.com/how-to/getting-started",
      "https://roast-timer.com/how-to/using-profiles",
      "https://roast-timer.com/how-to/cupping-notes",
      "https://roast-timer.com/how-to/development-ratios",
      "https://roast-timer.com/how-to/first-crack-timing",
      "https://roast-timer.com/how-to/roast-defects",
      "https://roast-timer.com/how-to/behmor-2000ab-troubleshooting",
      "https://roast-timer.com/how-to/popcorn-popper-safety",
      "https://roast-timer.com/how-to/roasters/gene-cafe-cbr-101",
      "https://roast-timer.com/how-to/roasters/behmor-2000ab",
      "https://roast-timer.com/how-to/roasters/freshroast-sr800",
      "https://roast-timer.com/how-to/roasters/kaldi-wide",
      "https://roast-timer.com/how-to/roasters/hottop-kn-8828",
      "https://roast-timer.com/how-to/roasters/popcorn-popper"
    ].map((url, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url
    }))
  };

  return (
    <>
      <Helmet>
        <title>Home Coffee Roasting Guides: First Crack, Defects, and Roaster Setup</title>
        <meta name="description" content="Step-by-step coffee roasting guides for Gene Cafe, Behmor, FreshRoast, KALDI, Hottop, and popcorn poppers. Learn first crack timing, defect fixes, and profile replication." />
        <meta name="keywords" content="coffee roast timer, how to roast coffee, coffee roasting guide, roast tracking, roast profiles" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Home Coffee Roasting Guides: First Crack, Defects, and Roaster Setup" />
        <meta property="og:description" content="Learn practical home roasting workflows, troubleshooting, and roaster-specific setup guides." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roast-timer.com/how-to" />
        <link rel="canonical" href="https://roast-timer.com/how-to" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">How to Use Roast Timer</h1>
            <p className="text-lg text-muted-foreground">
              Master coffee roasting with Roast Timer. Track temperatures, save profiles, and replicate your best roasts.
            </p>
          </div>

          {/* Quick Start */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2">
                <li>Create a free account or sign in</li>
                <li>Select your coffee roaster from the dropdown</li>
                <li>Click "Start Roasting" to begin tracking</li>
                <li>Record crack events and temperatures during your roast</li>
                <li>Save your profile with bean details and notes</li>
              </ol>
              <Link 
                to="/how-to/getting-started" 
                className="text-primary hover:underline mt-4 inline-block"
              >
                View detailed getting started guide →
              </Link>
            </CardContent>
          </Card>

          {/* Essential Guides */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Essential Guides</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5" />
                    Getting Started
                  </CardTitle>
                  <CardDescription>
                    Set up your account and start your first roast
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    to="/how-to/getting-started" 
                    className="text-primary hover:underline"
                  >
                    Read guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Coffee className="h-5 w-5" />
                    Using Roast Profiles
                  </CardTitle>
                  <CardDescription>
                    Learn how to replicate roasts using saved profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    to="/how-to/using-profiles" 
                    className="text-primary hover:underline"
                  >
                    Read guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Thermometer className="h-5 w-5" />
                    Understanding Development Ratios
                  </CardTitle>
                  <CardDescription>
                    Master the science behind quality roasts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    to="/how-to/development-ratios" 
                    className="text-primary hover:underline"
                  >
                    Read guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Coffee className="h-5 w-5" />
                    Adding Cupping Notes
                  </CardTitle>
                  <CardDescription>
                    Document taste evaluations and improve your roasts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    to="/how-to/cupping-notes" 
                    className="text-primary hover:underline"
                  >
                    Read guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Thermometer className="h-5 w-5" />
                    First Crack Timing
                  </CardTitle>
                  <CardDescription>
                    Learn to diagnose early or late first crack and roast with consistency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to="/how-to/first-crack-timing"
                    className="text-primary hover:underline"
                  >
                    Read guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Coffee className="h-5 w-5" />
                    Roast Defects
                  </CardTitle>
                  <CardDescription>
                    Fix baked, scorched, and underdeveloped roasts with clear adjustments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to="/how-to/roast-defects"
                    className="text-primary hover:underline"
                  >
                    Read guide →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Troubleshooting and Safety</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Behmor 2000AB Troubleshooting</CardTitle>
                  <CardDescription>
                    Resolve late first crack, stalled roasts, and extension timing issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to="/how-to/behmor-2000ab-troubleshooting"
                    className="text-primary hover:underline"
                  >
                    View troubleshooting guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popcorn Popper Safety</CardTitle>
                  <CardDescription>
                    Batch size limits, ventilation checklist, and safer starter profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    to="/how-to/popcorn-popper-safety"
                    className="text-primary hover:underline"
                  >
                    View safety guide →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Roaster-Specific Guides */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Roaster-Specific Guides</h2>
            <p className="text-muted-foreground mb-4">
              Detailed instructions for tracking roasts with your specific coffee roaster.
            </p>
            
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Gene Cafe CBR-101</CardTitle>
                  <CardDescription>
                    Dual temperature tracking with transparent drum monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    to="/how-to/roasters/gene-cafe-cbr-101" 
                    className="text-primary hover:underline text-sm"
                  >
                    View Gene Cafe guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Behmor 2000AB Plus</CardTitle>
                  <CardDescription>
                    Profile-based roasting with time extensions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    to="/how-to/roasters/behmor-2000ab" 
                    className="text-primary hover:underline text-sm"
                  >
                    View Behmor guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">FreshRoast SR800</CardTitle>
                  <CardDescription>
                    Heat and fan control for small batch roasting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    to="/how-to/roasters/freshroast-sr800" 
                    className="text-primary hover:underline text-sm"
                  >
                    View FreshRoast SR800 guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">KALDI Wide</CardTitle>
                  <CardDescription>
                    Manual roasting with voice input and hands-free tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    to="/how-to/roasters/kaldi-wide" 
                    className="text-primary hover:underline text-sm"
                  >
                    View KALDI Wide guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Hottop KN-8828B-2K+</CardTitle>
                  <CardDescription>
                    Advanced controls with RoR tracking and automatic modes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    to="/how-to/roasters/hottop-kn-8828" 
                    className="text-primary hover:underline text-sm"
                  >
                    View Hottop guide →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Air Popcorn Popper</CardTitle>
                  <CardDescription>
                    Budget-friendly roasting with visual cue tracking and safety tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    to="/how-to/roasters/popcorn-popper" 
                    className="text-primary hover:underline text-sm"
                  >
                    View Popcorn Popper guide →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowTo;
