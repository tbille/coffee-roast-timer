import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const BehmorTroubleshooting = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why is first crack late on my Behmor 2000AB?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Late first crack on Behmor is commonly caused by oversized batch size, low ambient heat, or an energy-light profile."
        }
      },
      {
        "@type": "Question",
        name: "How should I use extensions on Behmor?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use extensions earlier in the roast to maintain momentum, instead of stacking them at the end."
        }
      },
      {
        "@type": "Question",
        name: "What causes uneven color in Behmor roasts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Uneven color often comes from overloaded batches, poor bean movement, or maintenance issues such as dirty drum or chaff components."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Behmor 2000AB Troubleshooting for Better Roasts</title>
        <meta
          name="description"
          content="Troubleshoot common Behmor 2000AB roasting issues: late first crack, stalled roasts, uneven color, and extension timing. Practical fixes for repeatable results."
        />
        <meta
          name="keywords"
          content="Behmor troubleshooting, Behmor 2000AB roast guide, first crack late, uneven roast, coffee roasting"
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Behmor 2000AB Troubleshooting for Better Roasts" />
        <meta property="og:description" content="Fix late first crack, stalled roasts, and uneven development on Behmor with practical, repeatable adjustments." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://roast-timer.com/how-to/behmor-2000ab-troubleshooting" />
        <link rel="canonical" href="https://roast-timer.com/how-to/behmor-2000ab-troubleshooting" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <h1 className="text-4xl font-bold mb-4">Behmor 2000AB Troubleshooting</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Fix the most common Behmor issues with simple, testable adjustments.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>First Crack Is Too Late</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Likely causes are oversized batch, cool ambient room, or too conservative profile.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Drop batch size toward 300-340g</li>
                  <li>Preheat consistently before charging</li>
                  <li>Start from a profile with more early energy</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Roast Stalls Near First Crack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>If momentum drops, cup quality becomes flat and baked.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use extensions earlier, not all at the end</li>
                  <li>Avoid over-venting during Maillard</li>
                  <li>Compare your first-crack timing against successful past batches</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uneven Color or Spotty Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Uneven roasts usually come from bean movement and load issues.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Check that chaff tray and drum are clean</li>
                  <li>Reduce batch size if bean movement looks sluggish</li>
                  <li>Use consistent green coffee moisture and density</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Improve Repeatability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Log profile choice and each extension moment</li>
                  <li>Track first crack and drop time on every roast</li>
                  <li>Target a stable development ratio range (often 20-25%)</li>
                </ul>
                <p>
                  Pair this with the full <Link to="/how-to/roasters/behmor-2000ab" className="text-primary hover:underline">Behmor setup guide</Link>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default BehmorTroubleshooting;
