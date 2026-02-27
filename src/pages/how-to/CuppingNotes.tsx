import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Coffee } from "lucide-react";

const CuppingNotes = () => {
  return (
    <>
      <Helmet>
        <title>How to Add Cupping Notes to Coffee Roast Profiles</title>
        <meta name="description" content="Learn how to document taste evaluations and cupping notes for your coffee roasts. Improve your roasting by connecting technique to cup quality." />
        <meta name="keywords" content="coffee cupping notes, tasting notes, coffee evaluation, SCA cupping, flavor notes, coffee scoring" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://roast-timer.com/how-to/cupping-notes" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <h1 className="text-4xl font-bold mb-4">Adding Cupping Notes to Roast Profiles</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Document taste evaluations to connect roasting technique with cup quality and improve over time.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What Are Cupping Notes?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Cupping notes are taste evaluations that record how your roasted coffee actually tastes after brewing.</p>
                <p>They create a complete record connecting:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Roasting technique (temperature, development time)</li>
                  <li>Sensory observations during roast</li>
                  <li>Cup quality and flavor characteristics</li>
                </ul>
                <p>This feedback loop helps you improve your roasting by understanding which techniques produce the best flavors.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>When to Cup Your Coffee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Rest period matters.</strong> Coffee needs time after roasting for gases to degas and flavors to develop.</p>
                <p><strong>Recommended rest times:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Minimum:</strong> 24 hours (barely acceptable)</li>
                  <li><strong>Light roasts:</strong> 5-7 days (best)</li>
                  <li><strong>Medium roasts:</strong> 3-5 days (best)</li>
                  <li><strong>Dark roasts:</strong> 2-3 days (best)</li>
                </ul>
                <p>Cup too early and you'll taste roasty, harsh notes that will fade. Wait for optimal rest.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Add Cupping Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>1. Open your roast profile</strong> from the Dashboard.</p>
                <p><strong>2. Scroll to the Cupping Notes section</strong> at the bottom of the profile page.</p>
                <p><strong>3. Click "Add Cupping Notes"</strong> (only visible if you own the profile).</p>
                <p><strong>4. Fill in the cupping form:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Overall Score:</strong> 1-10 rating (optional)</li>
                  <li><strong>Flavor Tags:</strong> Select descriptors (fruity, chocolatey, nutty, etc.)</li>
                  <li><strong>Tasting Notes:</strong> Detailed flavor observations</li>
                  <li><strong>Brew Method:</strong> How you prepared it (pour over, espresso, etc.)</li>
                  <li><strong>Photos:</strong> Upload photos of brewed coffee (optional)</li>
                </ul>
                <p><strong>5. Save</strong> to attach notes to your profile permanently.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What to Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Aroma:</strong> What do you smell? (Fruity, floral, caramel, chocolate, nutty, spicy)</p>
                <p><strong>Flavor:</strong> What do you taste? Be specific. Instead of "fruity," try "blueberry and citrus."</p>
                <p><strong>Acidity:</strong> Brightness level. (Bright like lemon, mellow like apple, low)</p>
                <p><strong>Body:</strong> Mouthfeel weight. (Light/tea-like, medium, heavy/syrupy)</p>
                <p><strong>Aftertaste:</strong> What lingers? (Clean, sweet, bitter, long-lasting)</p>
                <p><strong>Balance:</strong> Do flavors work together harmoniously?</p>
                <p><strong>Defects:</strong> Any off flavors? (Burned, grassy, astringent, sour)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Using Flavor Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Roast Timer provides common flavor descriptors as quick tags:</p>
                <p><strong>Fruit:</strong> Berry, Citrus, Stone Fruit, Tropical</p>
                <p><strong>Sweet:</strong> Chocolate, Caramel, Honey, Brown Sugar</p>
                <p><strong>Nuts & Spice:</strong> Nutty, Spicy, Herbal</p>
                <p><strong>Other:</strong> Floral, Earthy, Winey, Smoky</p>
                <p>Select multiple tags that apply. These make profiles searchable by flavor.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connecting Notes to Roast Technique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Use cupping notes to refine your roasting:</strong></p>
                <p><strong>If flavors are underdeveloped</strong> (grassy, sour, astringent):</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Increase development time (extend roast after first crack)</li>
                  <li>Reduce heat near the end to allow more time</li>
                  <li>Target 20-25% development ratio</li>
                </ul>
                <p><strong>If flavors are overdeveloped</strong> (ashy, bitter, flat):</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Shorten development time</li>
                  <li>Drop earlier after first crack</li>
                  <li>Avoid extended time at high temperatures</li>
                </ul>
                <p><strong>If flavors are baked</strong> (dull, lacking brightness):</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Increase heat in middle phase (Maillard)</li>
                  <li>Shorten total roast time</li>
                  <li>Maintain momentum approaching first crack</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brew Method Consistency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Use the same brew method</strong> when comparing roasts for consistency.</p>
                <p><strong>Document your brew parameters:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Coffee dose (e.g., 18g)</li>
                  <li>Water amount (e.g., 300ml)</li>
                  <li>Water temperature (e.g., 96°C)</li>
                  <li>Brew time (e.g., 2:30)</li>
                </ul>
                <p>Changing brew method changes flavor. Keep it consistent to isolate roast variables.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tracking Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Your dashboard becomes a learning tool:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Compare profiles with high scores to understand what worked</li>
                  <li>Identify patterns in your best roasts</li>
                  <li>See how development ratios correlate with cup quality</li>
                  <li>Track improvements in your roasting over months</li>
                </ul>
                <p>The combination of roast data + cupping notes = complete understanding.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sharing Cupped Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Profiles with cupping notes are more valuable to the community.</p>
                <p>When you share a profile with cupping notes, others can:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Replicate your roast technique</li>
                  <li>Understand expected flavor outcomes</li>
                  <li>Learn from your successes (and mistakes)</li>
                </ul>
                <p>Consider sharing your best profiles with detailed notes to help others learn.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <Link to="/dashboard" className="text-primary hover:underline">
                      Go to Dashboard
                    </Link> - Add cupping notes to your past roasts
                  </li>
                  <li>
                    <Link to="/how-to/development-ratios" className="text-primary hover:underline">
                      Understanding Development Ratios
                    </Link> - Learn how roast technique affects flavor
                  </li>
                  <li>
                    <Link to="/how-to/using-profiles" className="text-primary hover:underline">
                      Using Profiles
                    </Link> - Replicate roasts to test techniques
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

export default CuppingNotes;
