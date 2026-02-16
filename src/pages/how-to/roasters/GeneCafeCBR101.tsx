import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Thermometer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GeneCafeCBR101 = () => {
  return (
    <>
      <Helmet>
        <title>How to Use Gene Cafe CBR-101 with Roast Timer</title>
        <meta name="description" content="Complete guide for tracking coffee roasts on the Gene Cafe CBR-101. Learn dual temperature tracking, transparent drum monitoring, and replication techniques." />
        <meta name="keywords" content="Gene Cafe CBR-101, coffee roasting, dual temperature tracking, roast timer, temperature adjustment schedule" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Gene Cafe CBR-101</h1>
            <p className="text-muted-foreground">Dual temperature tracking with transparent drum monitoring</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Quick Specs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Capacity:</span>
                  <Badge variant="secondary">100-300g (recommended: 225g)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Control Type:</span>
                  <Badge variant="secondary">Dual Temperature</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typical Roast Time:</span>
                  <Badge variant="secondary">10-20 minutes</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timer Mode:</span>
                  <Badge variant="secondary">Count-up</Badge>
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
                <p><strong>1. Select Gene Cafe CBR-101</strong> from the roaster dropdown on the home page.</p>
                <p><strong>2. The interface will display:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Target temperature input</li>
                  <li>Current temperature input</li>
                  <li>Temperature history chart</li>
                  <li>Crack event buttons</li>
                </ul>
                <p><strong>3. Preheat your roaster</strong> according to manufacturer instructions before starting.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>During the Roast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Start the timer</strong> when you add beans to the drum.</p>
                <p><strong>2. Track both temperatures:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Target Temperature: What you set on the roaster dial</li>
                  <li>Current Temperature: What the built-in display shows</li>
                </ul>
                <p><strong>3. Record temperature adjustments</strong> as you make them. Each adjustment creates a data point on your temperature schedule.</p>
                <p><strong>4. Monitor through the transparent drum</strong> and watch for color changes (yellowing, browning).</p>
                <p><strong>5. Record crack events:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>First crack: When you hear popping sounds</li>
                  <li>Second crack: Louder, faster cracks (if roasting dark)</li>
                </ul>
                <p><strong>6. End the roast</strong> when you reach your desired color and development time.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>After Roasting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Click "End Roast"</strong> to stop the timer.</p>
                <p><strong>2. Fill in the save dialog:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Bean name, origin, farm</li>
                  <li>Initial and final weight</li>
                  <li>Notes about the roast</li>
                </ul>
                <p><strong>3. Your temperature schedule is automatically saved</strong> showing when you adjusted temperature and to what values.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Replication Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>The Gene Cafe's key strength is precise temperature control.</strong> When replicating:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Follow the temperature adjustment schedule from your reference profile</li>
                  <li>Match the timing of adjustments (e.g., "reduce to 195°C at 5:30")</li>
                  <li>Use the transparent drum to compare visual progression</li>
                  <li>Adjust batch size proportionally if not using the exact weight</li>
                </ul>
                <p><strong>Room temperature matters.</strong> In cold environments, you may need slightly higher target temperatures.</p>
                <p><strong>Development ratio is key.</strong> Aim for 20-25% of total roast time after first crack.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example Temperature Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">Typical schedule for a medium roast:</p>
                <div className="space-y-2 font-mono text-sm">
                  <div>0:00 → 200°C (Starting temperature)</div>
                  <div>5:30 → 195°C (After yellowing)</div>
                  <div>10:15 → 190°C (First crack begins)</div>
                  <div>13:00 → 185°C (Development phase)</div>
                  <div>15:30 → Drop (End roast)</div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  This is an example only. Your schedule will vary based on beans and desired roast level.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discover Gene Cafe Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Browse roast profiles from other Gene Cafe CBR-101 users for inspiration and replication.
                </p>
                <Link 
                  to="/discover?roaster=gene-cbr-101" 
                  className="text-primary hover:underline"
                >
                  View Gene Cafe CBR-101 profiles →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneCafeCBR101;
