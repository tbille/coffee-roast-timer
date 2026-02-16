import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FreshRoastSR800 = () => {
  return (
    <>
      <Helmet>
        <title>How to Use FreshRoast SR800 with Roast Timer</title>
        <meta name="description" content="Complete guide for tracking FreshRoast SR800 roasts. Learn heat and fan control, small batch roasting, and fast roast techniques." />
        <meta name="keywords" content="FreshRoast SR800, coffee roasting, heat fan control, small batch roasting, fast roasting, roast timer" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">FreshRoast SR800</h1>
            <p className="text-muted-foreground">Heat and fan control for fast, small batch roasting</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Specs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Capacity:</span>
                  <Badge variant="secondary">50-150g (recommended: 120g)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Control Type:</span>
                  <Badge variant="secondary">Heat/Fan Control</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typical Roast Time:</span>
                  <Badge variant="secondary">6-12 minutes</Badge>
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
                <p><strong>1. Select FreshRoast SR800</strong> from the roaster dropdown on the home page.</p>
                <p><strong>2. The interface will display:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Heat level controls (Low, Medium, High)</li>
                  <li>Fan level controls (Low, Medium, High)</li>
                  <li>Control change history</li>
                  <li>Crack event buttons</li>
                </ul>
                <p><strong>3. Preheat briefly</strong> (optional) before adding beans.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>During the Roast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Start the timer</strong> when you add beans.</p>
                <p><strong>2. Record your heat and fan settings</strong> every time you make a change.</p>
                <p><strong>3. Typical progression:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Start: High heat, Medium fan (drying phase)</li>
                  <li>After 2-3 min: High heat, Low fan (Maillard phase)</li>
                  <li>After first crack: Medium heat, Medium fan (development)</li>
                  <li>Final minute: Low heat, High fan (finishing)</li>
                </ul>
                <p><strong>4. Watch the transparent chamber.</strong> Color changes happen quickly.</p>
                <p><strong>5. Record crack events</strong> when you hear them.</p>
                <p><strong>6. The SR800 roasts fast.</strong> Stay attentive throughout.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>After Roasting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. The machine auto-cools.</strong> Click "End Roast" when cooling begins.</p>
                <p><strong>2. Save your profile</strong> with bean details and notes.</p>
                <p><strong>3. Your heat/fan schedule is automatically saved</strong> showing when you adjusted settings and to what levels.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Replication Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>The SR800's strength is precise heat and fan control.</strong> When replicating:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Follow the heat/fan schedule from your reference profile</li>
                  <li>Match the timing of changes (e.g., "reduce to medium heat at 7:30")</li>
                  <li>Keep batch sizes consistent (affects heat retention)</li>
                  <li>Adjust for bean density (denser beans need more heat/time)</li>
                </ul>
                <p><strong>Fast roasts need attention.</strong> Events happen quickly. Don't walk away.</p>
                <p><strong>No built-in thermometer.</strong> External probes are optional but recommended for precision.</p>
                <p><strong>Fan speed affects roast speed.</strong> Lower fan = slower roast = more development time.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example Heat/Fan Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">Typical schedule for a 120g medium roast:</p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="grid grid-cols-3 gap-2 font-bold">
                    <div>Time</div>
                    <div>Heat</div>
                    <div>Fan</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>0:00</div>
                    <div>High</div>
                    <div>Medium</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>3:00</div>
                    <div>High</div>
                    <div>Low</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>6:30</div>
                    <div>Medium</div>
                    <div>Low</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>8:00</div>
                    <div>Low</div>
                    <div>Medium</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>9:30</div>
                    <div>-</div>
                    <div>Cool</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  First crack typically around 6:00. Development time ~3:30.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discover FreshRoast SR800 Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Browse roast profiles from other FreshRoast SR800 users for inspiration and replication.
                </p>
                <Link 
                  to="/discover?roaster=freshroast-sr800" 
                  className="text-primary hover:underline"
                >
                  View FreshRoast SR800 profiles →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreshRoastSR800;
