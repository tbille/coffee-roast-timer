import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const HottopKN8828 = () => {
  return (
    <>
      <Helmet>
        <title>How to Use Hottop KN-8828B-2K+ with Roast Timer</title>
        <meta name="description" content="Complete guide for tracking Hottop KN-8828B-2K+ roasts. Learn advanced controls, RoR tracking, automatic modes, and precision roasting techniques." />
        <meta name="keywords" content="Hottop KN-8828, advanced coffee roasting, RoR tracking, rate of rise, automatic roasting modes, roast timer" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://roast-timer.com/how-to/roasters/hottop-kn-8828" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Hottop KN-8828B-2K+</h1>
            <p className="text-muted-foreground">Advanced controls with RoR tracking and automatic modes</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Specs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Capacity:</span>
                  <Badge variant="secondary">100-300g (recommended: 250g)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Control Type:</span>
                  <Badge variant="secondary">Dual Temperature (Advanced)</Badge>
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
                <p><strong>1. Select Hottop KN-8828B-2K+</strong> from the roaster dropdown on the home page.</p>
                <p><strong>2. The interface will display:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Mode selector (Automatic or Manual)</li>
                  <li>Heat and fan percentage controls (Manual mode)</li>
                  <li>Temperature tracking (target + current)</li>
                  <li>Rate of Rise (RoR) metrics</li>
                  <li>Advanced statistics</li>
                </ul>
                <p><strong>3. Choose your mode:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Automatic:</strong> Preset profiles (Light, Medium, Dark)</li>
                  <li><strong>Manual:</strong> Full control of heat and fan percentages</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automatic Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Best for beginners or consistent results.</strong></p>
                <p><strong>1. Select roast level:</strong> Light, Medium, or Dark</p>
                <p><strong>2. Start the roast.</strong> The Hottop controls heat and fan automatically.</p>
                <p><strong>3. Monitor the display.</strong> Track temperatures and RoR.</p>
                <p><strong>4. The machine will beep at first crack</strong> and when roast is complete.</p>
                <p><strong>5. Record observations</strong> (visual cues, aromas) for your notes.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Full control for advanced roasters.</strong></p>
                <p><strong>1. Set initial heat and fan percentages.</strong> Typical starting: 80% heat, 70% fan.</p>
                <p><strong>2. Monitor Rate of Rise (RoR).</strong> Target: 15-20°F/min (8-11°C/min) during Maillard phase.</p>
                <p><strong>3. Adjust heat percentage</strong> to control temperature progression.</p>
                <p><strong>4. Adjust fan percentage</strong> to control roast speed and airflow.</p>
                <p><strong>5. Record each adjustment</strong> with timestamp in Roast Timer.</p>
                <p><strong>6. Watch for declining RoR</strong> approaching first crack. Maintain momentum.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>During the Roast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Start the timer</strong> when you begin the roast cycle.</p>
                <p><strong>2. Track temperatures continuously.</strong> The Hottop displays both bean and environmental temps.</p>
                <p><strong>3. Monitor RoR closely.</strong> Declining RoR = slowing roast = risk of baking.</p>
                <p><strong>4. Record crack events</strong> when you hear them.</p>
                <p><strong>5. In Manual mode, log every heat/fan adjustment</strong> for replication.</p>
                <p><strong>6. Target development time:</strong> 2-4 minutes after first crack for balanced roasts.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>After Roasting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. The Hottop auto-cools.</strong> Click "End Roast" when cooling begins.</p>
                <p><strong>2. Save your profile</strong> with:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Bean details</li>
                  <li>Mode used (Auto or Manual)</li>
                  <li>Heat/fan schedule (Manual mode)</li>
                  <li>RoR observations</li>
                  <li>Notes about adjustments</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Replication Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>The Hottop's strength is precision and repeatability.</strong> When replicating:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Automatic mode:</strong> Use the same preset. Adjust batch size for consistency.</li>
                  <li><strong>Manual mode:</strong> Follow the heat/fan percentage schedule from your reference</li>
                  <li>Match RoR patterns, not just temperatures</li>
                  <li>Keep batch sizes consistent (±25g)</li>
                  <li>Note environmental temperature (affects preheat)</li>
                </ul>
                <p><strong>RoR is critical.</strong> A roast with the same temps but different RoR will taste different.</p>
                <p><strong>Artisan software compatible.</strong> Export profiles from Artisan and track in Roast Timer for sharing.</p>
                <p><strong>Development ratio of 20-25% is ideal.</strong> Too short = underdeveloped, too long = baked.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example Manual Control Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">Typical schedule for a 250g medium roast:</p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="grid grid-cols-3 gap-2 font-bold">
                    <div>Time</div>
                    <div>Heat</div>
                    <div>Fan</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>0:00</div>
                    <div>80%</div>
                    <div>70%</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>5:00</div>
                    <div>75%</div>
                    <div>65%</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>9:00</div>
                    <div>70%</div>
                    <div>60%</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>12:30</div>
                    <div>65%</div>
                    <div>65%</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>15:00</div>
                    <div>Drop</div>
                    <div>-</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  First crack around 11:00. RoR maintained at 10-15°C/min throughout.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discover Hottop KN-8828 Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Browse roast profiles from other Hottop KN-8828B-2K+ users for inspiration and replication.
                </p>
                <Link 
                  to="/discover?roaster=hottop-kn-8828b-2k" 
                  className="text-primary hover:underline"
                >
                  View Hottop KN-8828 profiles →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default HottopKN8828;
