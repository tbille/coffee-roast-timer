import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PopcornPopper = () => {
  return (
    <>
      <Helmet>
        <title>How to Roast Coffee with a Popcorn Popper (Safely)</title>
        <meta name="description" content="Complete safety guide for roasting coffee with an air popcorn popper. Learn batch size limits, visual cue tracking, and beginner-friendly roasting techniques." />
        <meta name="keywords" content="popcorn popper coffee roasting, budget coffee roasting, beginner roasting, air popper roasting, home coffee roasting safety" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Air Popcorn Popper</h1>
            <p className="text-muted-foreground">Budget-friendly roasting with visual cue tracking and safety focus</p>
          </div>

          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Safety Warning</AlertTitle>
            <AlertDescription>
              <strong>NEVER exceed 100g batch size.</strong> Overloading creates fire risk. Roast outdoors or with excellent ventilation. Never leave unattended. Have a fire extinguisher nearby.
            </AlertDescription>
          </Alert>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Quick Specs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Capacity:</span>
                  <Badge variant="destructive">50-100g MAX (recommended: 75g)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Control Type:</span>
                  <Badge variant="secondary">Manual Simple</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typical Roast Time:</span>
                  <Badge variant="secondary">4-8 minutes (very fast)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <Badge variant="destructive">Outdoor recommended</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Safety Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Before you begin:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Use only side-vented air poppers</strong> (Presto PowerPop, West Bend Poppery, etc.)</li>
                  <li><strong>Roast outdoors or in well-ventilated area.</strong> Smoke production is significant.</li>
                  <li><strong>Have fire extinguisher nearby.</strong> Chaff can ignite.</li>
                  <li><strong>Use heat-resistant container for cooling.</strong> Metal colander works well.</li>
                  <li><strong>Never exceed 100g.</strong> Measure beans carefully.</li>
                  <li><strong>Never leave unattended.</strong> Events happen in seconds.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Select Air Popcorn Popper</strong> from the roaster dropdown on the home page.</p>
                <p><strong>2. The interface will display:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Batch size warning (prominently displayed)</li>
                  <li>Visual cue tracker</li>
                  <li>Fast-roast optimized timer</li>
                  <li>Crack event buttons</li>
                </ul>
                <p><strong>3. Measure your beans.</strong> 75g is ideal for most poppers. Never exceed 100g.</p>
                <p><strong>4. Preheat popper</strong> for 30 seconds before adding beans.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>During the Roast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Start the timer</strong> when you add beans.</p>
                <p><strong>2. Watch the chamber constantly.</strong> Roast happens very fast.</p>
                <p><strong>3. Track visual cues</strong> using the tracker:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>0-2 min:</strong> Green to yellow (drying)</li>
                  <li><strong>2-4 min:</strong> Yellow to light brown (Maillard)</li>
                  <li><strong>4-6 min:</strong> Light brown to medium brown (first crack)</li>
                  <li><strong>6-8 min:</strong> Medium to dark brown (development)</li>
                </ul>
                <p><strong>4. First crack comes fast.</strong> Usually 4-5 minutes. Record immediately.</p>
                <p><strong>5. Pour beans immediately</strong> when desired color is reached. Residual heat continues roasting.</p>
                <p><strong>6. Cool beans quickly</strong> in metal colander, stirring constantly.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>After Roasting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Click "End Roast"</strong> when you pour beans out.</p>
                <p><strong>2. Let popper cool completely</strong> before next roast (minimum 10 minutes).</p>
                <p><strong>3. Save your profile</strong> with:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Bean details</li>
                  <li>Exact batch size used</li>
                  <li>Visual progression notes</li>
                  <li>Timing of color changes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Replication Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Popcorn poppers are unpredictable but affordable.</strong> When replicating:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use exact same batch size as reference roast</li>
                  <li>Match visual cues more than times (ambient temp affects speed)</li>
                  <li>Listen for first crack timing</li>
                  <li>Pour 30-60 seconds after desired color (residual heat factor)</li>
                </ul>
                <p><strong>Ambient temperature matters greatly.</strong> Cold weather slows roast. Hot weather speeds it up.</p>
                <p><strong>Expect variability.</strong> Popcorn poppers lack precise control. Focus on sensory cues.</p>
                <p><strong>Development is brief.</strong> 1-2 minutes after first crack is typical. Anything longer risks burning.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visual Cue Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Learn to identify roast stages by sight:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Green:</strong> Raw beans, starting state</li>
                  <li><strong>Yellow:</strong> Drying complete, grassy smell fades</li>
                  <li><strong>Light brown/cinnamon:</strong> Approaching first crack</li>
                  <li><strong>Medium brown:</strong> First crack happening, expansion visible</li>
                  <li><strong>Dark brown:</strong> Post first crack, oils may appear</li>
                  <li><strong>Very dark/black:</strong> Approaching second crack, risk of fire</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Stop at your desired color. Beans continue darkening during cooling.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Beans not moving:</strong> Batch too large. Reduce to 75g or less.</p>
                <p><strong>Scorching on bottom:</strong> Popper running too hot. Try smaller batch or stir manually.</p>
                <p><strong>Uneven roast:</strong> Normal for poppers. Separate light and dark beans after roasting if needed.</p>
                <p><strong>Smoke inside house:</strong> Move outdoors. Poppers produce significant smoke.</p>
                <p><strong>Chaff everywhere:</strong> Roast outdoors or use shop vacuum nearby for cleanup.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discover Popcorn Popper Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Browse roast profiles from other popcorn popper users for inspiration and techniques.
                </p>
                <Link 
                  to="/discover?roaster=air-popcorn-popper" 
                  className="text-primary hover:underline"
                >
                  View Popcorn Popper profiles →
                </Link>
              </CardContent>
            </Card>

            <Alert className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Upgrade Path</AlertTitle>
              <AlertDescription>
                The popcorn popper is a great entry point to learn roasting basics. When ready to upgrade, consider the FreshRoast SR800 for similar speed with better control, or the Gene Cafe CBR-101 for larger batches and temperature precision.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </>
  );
};

export default PopcornPopper;
