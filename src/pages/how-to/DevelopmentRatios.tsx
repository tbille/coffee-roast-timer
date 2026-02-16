import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DevelopmentRatios = () => {
  return (
    <>
      <Helmet>
        <title>Understanding Coffee Roast Development Ratios</title>
        <meta name="description" content="Master development ratios to improve coffee roast quality. Learn the science behind balanced roasts and how timing after first crack affects flavor." />
        <meta name="keywords" content="development ratio, coffee roasting science, first crack, development time, roast quality, balanced roast" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <h1 className="text-4xl font-bold mb-4">Understanding Development Ratios</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Master the single most important metric for coffee roast quality.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is Development Ratio?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Development ratio is the percentage of total roast time spent after first crack begins.</p>
                <p className="font-mono text-sm bg-muted p-3 rounded">
                  Development Ratio = (Development Time ÷ Total Roast Time) × 100%
                </p>
                <p><strong>Example:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Total roast time: 15:00 (900 seconds)</li>
                  <li>First crack at: 11:00 (660 seconds)</li>
                  <li>Development time: 4:00 (240 seconds)</li>
                  <li>Development ratio: 240 ÷ 900 = 26.7%</li>
                </ul>
                <p>This single number predicts cup quality better than any other metric.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  The Golden Range
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Under 15%</span>
                    <Badge variant="destructive">Very Underdeveloped</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    Grassy, sour, astringent. Beans not fully developed. Avoid.
                  </p>

                  <div className="flex items-center justify-between">
                    <span>15-20%</span>
                    <Badge variant="secondary">Light Roast</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    Bright acidity, delicate flavors. Good for Nordic/filter styles.
                  </p>

                  <div className="flex items-center justify-between">
                    <span>20-25%</span>
                    <Badge variant="default">Ideal Balanced</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    Sweet spot for most roasts. Balanced acidity, body, and sweetness.
                  </p>

                  <div className="flex items-center justify-between">
                    <span>25-30%</span>
                    <Badge variant="secondary">Dark Roast</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    Fuller body, lower acidity. Chocolate and caramel notes dominant.
                  </p>

                  <div className="flex items-center justify-between">
                    <span>Over 30%</span>
                    <Badge variant="destructive">Overdeveloped</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    Ashy, bitter, flat. Origin character lost. Avoid unless intentional.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Development Ratio Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Chemical reactions during development:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Caramelization of sugars (sweetness)</li>
                  <li>Maillard reactions complete (flavor complexity)</li>
                  <li>Organic acids transform (balanced acidity)</li>
                  <li>Volatile aromatics develop (fragrance)</li>
                </ul>
                <p><strong>Too little development:</strong> Reactions incomplete. Flavors remain grassy, vegetal, or sour.</p>
                <p><strong>Too much development:</strong> Reactions go too far. Flavors become ashy, bitter, or burned.</p>
                <p><strong>Just right:</strong> Sweetness emerges, acidity balances, origin character shines.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Control Development Ratio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>To increase development ratio</strong> (make it longer):</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Reduce heat after first crack</li>
                  <li>Extend time before dropping beans</li>
                  <li>Start with higher initial temperature (shorter pre-crack time)</li>
                </ul>
                <p><strong>To decrease development ratio</strong> (make it shorter):</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maintain heat after first crack</li>
                  <li>Drop beans earlier</li>
                  <li>Start with lower initial temperature (longer pre-crack time)</li>
                </ul>
                <p><strong>Key insight:</strong> Development ratio is relative to total time, not absolute minutes.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Development Time vs Ratio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Absolute time matters less than the ratio.</strong></p>
                <p><strong>Example 1:</strong> 15-minute roast, 3:45 development = 25%</p>
                <p><strong>Example 2:</strong> 10-minute roast, 2:30 development = 25%</p>
                <p>Both have the same development ratio despite different absolute times.</p>
                <p><strong>Why this matters:</strong> Different roasters and batch sizes change total time, but targeting the same ratio produces similar cup quality.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Viewing Development Stats in Roast Timer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Roast Timer automatically calculates development statistics for every profile.</p>
                <p><strong>Where to find it:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Profile details page - Roaster Settings card</li>
                  <li>Dashboard - Hover over profile cards</li>
                  <li>Comparison view - Side-by-side stats</li>
                </ul>
                <p><strong>What you'll see:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>First crack time</li>
                  <li>Development time (minutes:seconds)</li>
                  <li>Development ratio (percentage)</li>
                  <li>Visual indicator (good/needs adjustment)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bean Density and Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Denser beans need longer development:</strong></p>
                <p><strong>High-grown/dense beans</strong> (African, Central American high-altitude):</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Target 22-25% development ratio</li>
                  <li>May need 3-4 minutes after first crack</li>
                  <li>Can handle higher temperatures</li>
                </ul>
                <p><strong>Lower-grown/softer beans</strong> (Brazilian, Indonesian low-altitude):</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Target 18-22% development ratio</li>
                  <li>May need only 2-3 minutes after first crack</li>
                  <li>More delicate, easier to overdevelop</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Development Mistakes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Mistake 1: Rushing to first crack, then coasting.</strong></p>
                <p className="text-sm text-muted-foreground ml-4">
                  Result: High development ratio but baked flavor (long, slow development).
                </p>
                <p><strong>Mistake 2: Dropping immediately after first crack.</strong></p>
                <p className="text-sm text-muted-foreground ml-4">
                  Result: Underdeveloped, sour, grassy flavors.
                </p>
                <p><strong>Mistake 3: Extending development too long.</strong></p>
                <p className="text-sm text-muted-foreground ml-4">
                  Result: Ashy, bitter, origin character lost.
                </p>
                <p><strong>The solution:</strong> Target 20-25% development with good momentum maintained throughout.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Using Development Ratio for Replication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>When replicating a roast profile:</strong></p>
                <p>Match the development ratio, even if absolute times differ.</p>
                <p><strong>Example scenario:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Reference roast: 14:00 total, 10:30 to first crack, 3:30 development (25%)</li>
                  <li>Your roast: First crack at 11:00</li>
                  <li>To match 25% ratio: Develop for 3:40 (11:00 + 3:40 = 14:40 total)</li>
                </ul>
                <p>This approach accounts for differences in roaster, batch size, and environmental factors.</p>
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
                      Review Your Dashboard
                    </Link> - Check development ratios on your past roasts
                  </li>
                  <li>
                    <Link to="/how-to/cupping-notes" className="text-primary hover:underline">
                      Add Cupping Notes
                    </Link> - Connect development ratios to cup quality
                  </li>
                  <li>
                    <Link to="/discover" className="text-primary hover:underline">
                      Browse Community Profiles
                    </Link> - See development ratios from successful roasts
                  </li>
                  <li>
                    <Link to="/how-to/using-profiles" className="text-primary hover:underline">
                      Learn Profile Replication
                    </Link> - Use development ratios to replicate roasts
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

export default DevelopmentRatios;
