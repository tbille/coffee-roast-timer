import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const UsingProfiles = () => {
  return (
    <>
      <Helmet>
        <title>How to Use Roast Profiles to Replicate Coffee Roasts</title>
        <meta name="description" content="Learn how to use roast profiles to replicate your best coffee roasts. Understand timelines, temperature curves, sensory checkpoints, and development ratios." />
        <meta name="keywords" content="coffee roast profiles, replicate roast, roast replication, coffee roasting guide, temperature curves, development ratio" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://roast-timer.com/how-to/using-profiles" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <h1 className="text-4xl font-bold mb-4">Using Roast Profiles to Replicate Roasts</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Learn how to use saved profiles as a reference to recreate your best roasts consistently.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is a Roast Profile?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>A roast profile is a complete record of a coffee roast, capturing all the data needed to replicate it:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Bean details (name, origin, farm, processing method)</li>
                  <li>Roaster type and settings used</li>
                  <li>Timeline of key events (yellowing, first crack, second crack)</li>
                  <li>Temperature adjustments throughout the roast</li>
                  <li>Sensory checkpoints (what you see, hear, smell)</li>
                  <li>Development statistics and quality metrics</li>
                  <li>Your notes and observations</li>
                </ul>
                <p>Think of it as a recipe for roasting that specific coffee.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Finding Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Access roast profiles in two ways:</p>
                <p><strong>Your Dashboard:</strong> View all your saved roasts. Filter by roaster type or search by bean name.</p>
                <p><strong>Discover Page:</strong> Browse profiles shared by the community. Filter by roaster to see roasts from equipment you own.</p>
                <p>Click any profile to view full details.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Understanding Profile Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Roast Timeline:</strong> Shows key milestones with exact times. Click dots on the timeline to see detailed sensory information.</p>
                <p><strong>Roaster Settings:</strong> Displays the specific configuration used. For Gene Cafe and Hottop, you'll see temperature schedules. For Behmor, profile and extensions. For FreshRoast and KALDI, heat and fan settings over time.</p>
                <p><strong>Temperature Graph:</strong> Visual representation with color-coded phases (drying, Maillard, development). Shows both target and actual temperatures if tracked.</p>
                <p><strong>Sensory Checkpoints:</strong> Time-stamped observations about appearance, sound, and aroma at key moments.</p>
                <p><strong>Development Stats:</strong> Quality metrics including development time and ratio. Aim for 20-25% for balanced roasts.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Using "Use as Reference"</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>When viewing a profile, click the "Use as Reference" button in the actions menu.</p>
                <p>This takes you to the home page with the profile pre-loaded as your reference guide.</p>
                <p>The reference profile stays visible while you roast, allowing you to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Compare your current time to the reference timeline</li>
                  <li>Match temperature adjustments at the same points</li>
                  <li>Anticipate upcoming events (first crack, etc.)</li>
                  <li>Aim for similar development ratios</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Replication Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Before Roasting:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Study the roaster settings and temperature schedule</li>
                  <li>Note the timing of key events (yellowing, first crack)</li>
                  <li>Review sensory checkpoints</li>
                  <li>Check starting conditions (room temp, bean temp)</li>
                </ul>
                <p><strong>During Roasting:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Follow the temperature schedule or control settings</li>
                  <li>Compare sensory observations to checkpoints</li>
                  <li>Adjust timing if events happen early or late</li>
                  <li>Target the same development ratio</li>
                </ul>
                <p><strong>After Roasting:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Save your new roast profile</li>
                  <li>Add notes about differences from the reference</li>
                  <li>Compare the two profiles side-by-side</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparing Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Use the comparison feature to analyze multiple roasts side-by-side.</p>
                <p>From your dashboard, select 2-3 profiles and click "Compare Selected".</p>
                <p>The comparison view shows:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Overlaid temperature curves</li>
                  <li>Side-by-side statistics</li>
                  <li>Timing differences for key events</li>
                  <li>Development ratio comparisons</li>
                </ul>
                <p>This helps you identify patterns in your successful roasts and spot areas for improvement.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Adding Cupping Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>After roasting and resting your coffee, add cupping notes to the profile.</p>
                <p>This creates a complete record linking roast technique to cup quality.</p>
                <p>Document flavor notes, scores, and brew method used.</p>
                <p className="text-sm text-muted-foreground">
                  See our guide on <Link to="/how-to/cupping-notes" className="text-primary hover:underline">Adding Cupping Notes</Link> for details.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Use timing over absolute temperature.</strong> First crack at 10:30 is more actionable than "first crack at 196°C" because ambient conditions vary.</p>
                <p><strong>Trust your senses.</strong> If beans look, sound, and smell right, you're on track even if times don't match exactly.</p>
                <p><strong>Adapt to your beans.</strong> Different origins and densities behave differently. Use profiles as guides, not rigid rules.</p>
                <p><strong>Track environmental factors.</strong> Room temperature and bean starting temperature affect roast progression.</p>
                <p><strong>Target development ratio.</strong> 20-25% is the sweet spot for most roasts. This is more important than matching exact times.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <Link to="/discover" className="text-primary hover:underline">
                      Browse Discover
                    </Link> - Find profiles from roasters similar to yours
                  </li>
                  <li>
                    <Link to="/how-to/development-ratios" className="text-primary hover:underline">
                      Understanding Development Ratios
                    </Link> - Learn the science of roast quality
                  </li>
                  <li>
                    <Link to="/how-to" className="text-primary hover:underline">
                      Roaster-Specific Guides
                    </Link> - Detailed instructions for your equipment
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

export default UsingProfiles;
