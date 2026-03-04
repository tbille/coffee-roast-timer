import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const FirstCrackTiming = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "When should first crack happen in a home roast?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For most home roasters, first crack often starts around 8 to 12 minutes depending on roaster type, batch size, and charge temperature."
        }
      },
      {
        "@type": "Question",
        name: "What if first crack is very early?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Early first crack usually indicates too much heat input or too small a batch. Reduce early heat or increase batch size slightly."
        }
      },
      {
        "@type": "Question",
        name: "What if first crack is very late?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Late first crack often means insufficient energy or oversized batch. Increase heat earlier or reduce batch size."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>First Crack Timing Guide for Home Coffee Roasting</title>
        <meta
          name="description"
          content="Learn how to time first crack in home coffee roasting. Diagnose early or late first crack and adjust heat, airflow, and batch size for better cup quality."
        />
        <meta
          name="keywords"
          content="first crack timing, coffee roasting first crack, home roasting guide, roast troubleshooting, development time"
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="First Crack Timing Guide for Home Coffee Roasting" />
        <meta property="og:description" content="Diagnose early or late first crack and adjust your roast for better repeatability and cup quality." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://roast-timer.com/how-to/first-crack-timing" />
        <link rel="canonical" href="https://roast-timer.com/how-to/first-crack-timing" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <h1 className="text-4xl font-bold mb-4">First Crack Timing Guide</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Use first crack as your anchor point for repeatable, high-quality roasts.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Target Window</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>For many home setups, first crack begins around 8:00 to 12:00.</p>
                <p>Use this as a starting window, then calibrate by bean density, batch size, and your machine.</p>
                <p>
                  Treat first crack timing as a consistency metric, not a hard rule. Matching your own successful timing is more important than matching anyone else's.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>When First Crack Is Too Early</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Early crack often leads to sharp acidity and thin sweetness.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Lower early heat input</li>
                  <li>Increase airflow more gradually</li>
                  <li>Slightly increase batch size if your roaster can handle it</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>When First Crack Is Too Late</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Late crack can produce baked flavors and muted acidity.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Increase early energy to avoid stalling</li>
                  <li>Reduce batch size for better heat penetration</li>
                  <li>Preheat more consistently between roasts</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Use It in Roast Timer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Record first crack as soon as it begins, then compare across batches.</p>
                <p>Track first crack timing alongside development ratio for better repeatability.</p>
                <p>
                  Next: <Link to="/how-to/development-ratios" className="text-primary hover:underline">development ratio targets</Link> and <Link to="/how-to/roast-defects" className="text-primary hover:underline">defect diagnosis</Link>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FirstCrackTiming;
