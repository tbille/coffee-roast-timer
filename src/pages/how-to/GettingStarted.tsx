import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const GettingStarted = () => {
  return (
    <>
      <Helmet>
        <title>Getting Started with Roast Timer - Coffee Roasting Guide</title>
        <meta name="description" content="Learn how to set up Roast Timer, select your coffee roaster, and start tracking your first roast. Simple step-by-step guide for beginners." />
        <meta name="keywords" content="coffee roast timer setup, start roasting coffee, roast tracking tutorial, coffee roasting for beginners" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://roast-timer.com/how-to/getting-started" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <h1 className="text-4xl font-bold mb-4">Getting Started with Roast Timer</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Set up your account and start tracking coffee roasts in minutes.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Create Your Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Click "Sign In" in the top right corner and create a free account.</p>
                <p>You can sign in with email or use magic link authentication for passwordless access.</p>
                <p>No credit card required. All core features are free.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Select Your Roaster</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>On the home page, use the roaster dropdown to select your coffee roasting equipment.</p>
                <p>We support 12+ roasters including Gene Cafe CBR-101, Behmor 2000AB, FreshRoast SR800, KALDI, Hottop, and more.</p>
                <p>The app will remember your selection for next time.</p>
                <p className="text-sm text-muted-foreground">
                  Not sure which roaster to choose? Check our <Link to="/how-to" className="text-primary hover:underline">roaster-specific guides</Link>.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Start Your First Roast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Click the "Start Roasting" button to begin tracking.</p>
                <p>The timer will start automatically. Record key events as they happen:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Temperature changes (for roasters with temperature control)</li>
                  <li>First crack - when you hear the first popping sounds</li>
                  <li>Second crack - louder, faster cracks (if you roast dark)</li>
                </ul>
                <p>The interface adapts to your roaster type, showing only relevant controls.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. End and Save Your Roast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>When your roast is complete, click "End Roast" to stop the timer.</p>
                <p>A save dialog will appear. Fill in the details:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Bean name (required)</li>
                  <li>Origin (e.g., Ethiopia)</li>
                  <li>Farm name</li>
                  <li>Processing method (washed, natural, honey)</li>
                  <li>Initial and final weight (for calculating weight loss)</li>
                  <li>Notes about the roast</li>
                </ul>
                <p>Click "Save Roast" to add it to your dashboard.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. View Your Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Access your saved roasts anytime from the Dashboard page.</p>
                <p>Features include:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>View all your roast profiles</li>
                  <li>Filter by roaster type</li>
                  <li>Search by bean name or origin</li>
                  <li>Compare multiple roasts side-by-side</li>
                  <li>Share profiles with the community</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Now that you know the basics, explore these guides:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <Link to="/how-to/using-profiles" className="text-primary hover:underline">
                      Using Roast Profiles
                    </Link> - Learn how to replicate successful roasts
                  </li>
                  <li>
                    <Link to="/how-to/development-ratios" className="text-primary hover:underline">
                      Understanding Development Ratios
                    </Link> - Master the science behind quality roasts
                  </li>
                  <li>
                    <Link to="/how-to" className="text-primary hover:underline">
                      Roaster-Specific Guides
                    </Link> - Detailed instructions for your equipment
                  </li>
                  <li>
                    <Link to="/discover" className="text-primary hover:underline">
                      Discover Page
                    </Link> - Browse community roast profiles for inspiration
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default GettingStarted;
