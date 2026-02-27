import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Timer, BookOpen, Thermometer } from "lucide-react";

const HowTo = () => {
  return (
    <>
      <Helmet>
        <title>How to Use Roast Timer - Complete Coffee Roasting Guide</title>
        <meta name="description" content="Learn how to use Roast Timer to track, save, and replicate coffee roasts. Step-by-step guides for Gene Cafe, Behmor, FreshRoast, KALDI, Hottop, and more." />
        <meta name="keywords" content="coffee roast timer, how to roast coffee, coffee roasting guide, roast tracking, roast profiles" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://roast-timer.com/how-to" />
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
