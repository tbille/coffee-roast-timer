import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Behmor2000AB = () => {
  return (
    <>
      <Helmet>
        <title>How to Use Behmor 2000AB Plus with Roast Timer</title>
        <meta name="description" content="Complete guide for tracking Behmor 2000AB Plus roasts. Learn profile selection, time extension tracking, and large batch roasting techniques." />
        <meta name="keywords" content="Behmor 2000AB, coffee roasting, profile based roasting, time extensions, roast timer, P1 P2 P3 P4 P5 profiles" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Behmor 2000AB Plus</h1>
            <p className="text-muted-foreground">Profile-based roasting with time extensions and large capacity</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Specs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Capacity:</span>
                  <Badge variant="secondary">200-454g (recommended: 340g)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Control Type:</span>
                  <Badge variant="secondary">Profile-Based</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typical Roast Time:</span>
                  <Badge variant="secondary">14-23 minutes</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timer Mode:</span>
                  <Badge variant="secondary">Countdown</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Select Behmor 2000AB Plus</strong> from the roaster dropdown on the home page.</p>
                <p><strong>2. The interface will display:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Profile selector (P1, P2, P3, P4, P5, Manual)</li>
                  <li>Extension tracker</li>
                  <li>Countdown timer</li>
                  <li>Crack event buttons</li>
                </ul>
                <p><strong>3. Choose your roasting profile</strong> based on batch size and desired roast level:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>P1: 18:00 (lighter roasts, larger batches)</li>
                  <li>P2: 16:30</li>
                  <li>P3: 15:00 (medium roasts, standard batches)</li>
                  <li>P4: 13:30</li>
                  <li>P5: 12:00 (darker roasts, smaller batches)</li>
                  <li>Manual: Full control</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>During the Roast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Start the timer</strong> when you start the Behmor.</p>
                <p><strong>2. The Behmor counts down.</strong> Use Roast Timer's countdown to track alongside.</p>
                <p><strong>3. Add time extensions</strong> by clicking the extension button when you add 30 seconds on the Behmor (up to 6 times).</p>
                <p><strong>4. Monitor through the glass door.</strong> Watch for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Yellowing phase (beans turn from green to yellow)</li>
                  <li>First crack (visible bean expansion and audible pops)</li>
                  <li>Color development</li>
                </ul>
                <p><strong>5. Record crack events</strong> using the buttons when you hear them.</p>
                <p><strong>6. The Behmor will auto-cool.</strong> End your timer when cooling begins.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>After Roasting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Click "End Roast"</strong> when the cooling cycle starts.</p>
                <p><strong>2. Save your profile</strong> with bean details and notes.</p>
                <p><strong>3. Your profile config is automatically saved:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Which profile you used (P1-P5 or Manual)</li>
                  <li>How many extensions and when you added them</li>
                  <li>Total roast duration</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Replication Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>The Behmor's unique feature is time extensions.</strong> When replicating:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use the same profile as the reference roast</li>
                  <li>Add extensions at the same time remaining (e.g., "add 30s at 3:00 remaining")</li>
                  <li>Match the total number of extensions</li>
                  <li>Use similar batch sizes (capacity affects heat retention)</li>
                </ul>
                <p><strong>No built-in thermometer.</strong> Use visual and auditory cues for timing. First crack timing is more important than temperature.</p>
                <p><strong>Larger batches need more time.</strong> 454g batches typically need P1 or P2 with extensions.</p>
                <p><strong>Development ratio matters.</strong> Aim for 20-25% of total time after first crack for balanced flavor.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example Profile Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">Typical setup for a 340g medium roast:</p>
                <div className="space-y-2 text-sm">
                  <div><strong>Profile:</strong> P3 (15:00 base duration)</div>
                  <div><strong>Extensions:</strong></div>
                  <div className="ml-4">@ 4:00 remaining → Add 30s</div>
                  <div className="ml-4">@ 2:30 remaining → Add 30s</div>
                  <div className="ml-4">@ 1:00 remaining → Add 30s</div>
                  <div><strong>Total Duration:</strong> 16:30</div>
                  <div><strong>First Crack:</strong> ~11:00</div>
                  <div><strong>Development:</strong> ~5:30 (33%)</div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  This is an example only. Your setup will vary based on beans and desired roast level.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discover Behmor Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Browse roast profiles from other Behmor 2000AB Plus users for inspiration and replication.
                </p>
                <Link 
                  to="/discover?roaster=behmor-2000ab-plus" 
                  className="text-primary hover:underline"
                >
                  View Behmor 2000AB Plus profiles →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Behmor2000AB;
