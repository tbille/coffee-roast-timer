import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const KaldiWide = () => {
  return (
    <>
      <Helmet>
        <title>How to Use KALDI Wide with Roast Timer</title>
        <meta name="description" content="Complete guide for tracking KALDI Wide roasts. Learn voice input, hands-free recording, manual flame control, and environmental tracking." />
        <meta name="keywords" content="KALDI Wide, manual coffee roasting, voice input, hands-free roasting, manual flame control, roast timer" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">KALDI Wide</h1>
            <p className="text-muted-foreground">Manual roasting with voice input and hands-free tracking</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Quick Specs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Capacity:</span>
                  <Badge variant="secondary">100-300g (recommended: 200g)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Control Type:</span>
                  <Badge variant="secondary">Manual Simple</Badge>
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
                <p><strong>1. Select KALDI Wide</strong> from the roaster dropdown on the home page.</p>
                <p><strong>2. The interface will display:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Voice input button (hands-free temperature recording)</li>
                  <li>Auto-record timer for temperature logging</li>
                  <li>Environmental conditions tracker</li>
                  <li>Manual temperature input</li>
                  <li>Crack event buttons</li>
                </ul>
                <p><strong>3. Set up your flame source</strong> and ensure proper ventilation (outdoor roasting recommended).</p>
                <p><strong>4. Have your thermometer ready</strong> (infrared or probe thermometer).</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voice Input Feature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>The KALDI's unique advantage is hands-free operation.</strong></p>
                <p><strong>To use voice input:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Click the microphone button to enable</li>
                  <li>Say temperature readings out loud: "190" or "three fifty"</li>
                  <li>The app records them automatically</li>
                  <li>Keep both hands free for cranking and flame control</li>
                </ul>
                <p><strong>Supported voice commands:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Numbers (temperature readings)</li>
                  <li>"First crack" - records first crack event</li>
                  <li>"Second crack" - records second crack event</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>During the Roast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Start the timer</strong> when you place beans over the flame.</p>
                <p><strong>2. Crank consistently</strong> to ensure even roasting.</p>
                <p><strong>3. Record temperatures</strong> using voice input or manual entry. Aim for readings every 30-60 seconds.</p>
                <p><strong>4. Adjust flame height</strong> based on temperature progression and visual cues.</p>
                <p><strong>5. Watch for visual changes:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Yellowing (green to yellow transition)</li>
                  <li>Browning (yellow to light brown)</li>
                  <li>First crack (beans expand, audible pops)</li>
                  <li>Development (color deepens)</li>
                </ul>
                <p><strong>6. Record crack events</strong> when you hear them.</p>
                <p><strong>7. Note environmental conditions</strong> (wind, ambient temperature) as they affect heat.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>After Roasting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Click "End Roast"</strong> when you remove beans from heat.</p>
                <p><strong>2. Cool beans immediately</strong> using your cooling method.</p>
                <p><strong>3. Save your profile</strong> with:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Bean details</li>
                  <li>Environmental notes (outdoor temp, wind conditions)</li>
                  <li>Flame adjustments you made</li>
                  <li>Observations about bean behavior</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Replication Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Manual roasting requires intuition.</strong> When replicating:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Match the temperature progression curve, not exact values</li>
                  <li>Use timing of events (yellowing, first crack) as primary guides</li>
                  <li>Adjust for environmental conditions (wind, ambient temp)</li>
                  <li>Keep cranking speed consistent with reference roast</li>
                </ul>
                <p><strong>Environmental factors matter greatly.</strong> A 20°C day requires different flame than a 5°C day.</p>
                <p><strong>Trust your senses.</strong> Sight, sound, and smell are as important as temperature readings.</p>
                <p><strong>Target development ratio of 20-25%.</strong> This matters more than absolute times or temperatures.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto-Record Timer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>For consistent temperature logging:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Enable auto-record timer (30 or 60 second intervals)</li>
                  <li>The app will prompt you at each interval</li>
                  <li>Use voice input to quickly state the temperature</li>
                  <li>Focus on roasting, not manual data entry</li>
                </ul>
                <p>This creates a consistent temperature curve for replication.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discover KALDI Wide Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Browse roast profiles from other KALDI Wide users for inspiration and replication.
                </p>
                <Link 
                  to="/discover?roaster=kaldi-wide" 
                  className="text-primary hover:underline"
                >
                  View KALDI Wide profiles →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default KaldiWide;
