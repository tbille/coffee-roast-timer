import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const PopcornPopperSafety = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much coffee can I roast in a popcorn popper?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A practical range is often 50 to 85 grams, and 100 grams should be treated as a hard ceiling for many poppers."
        }
      },
      {
        "@type": "Question",
        name: "Is roasting coffee in a popcorn popper safe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It can be done more safely with strict ventilation, active supervision, and conservative batch sizes, but it still carries heat and smoke risk."
        }
      },
      {
        "@type": "Question",
        name: "When should I drop the roast on a popcorn popper?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A common starter approach is dropping 60 to 120 seconds after first crack for light to medium results, then adjusting by taste."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Popcorn Popper Coffee Roasting Safety and Profile Tips</title>
        <meta
          name="description"
          content="Safe popcorn popper coffee roasting guide: batch size limits, ventilation, fire-risk reduction, and a repeatable starter profile for better results."
        />
        <meta
          name="keywords"
          content="popcorn popper coffee roasting safety, popcorn popper batch size, coffee roasting beginner guide"
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Popcorn Popper Coffee Roasting Safety and Profile Tips" />
        <meta property="og:description" content="Use safer batch sizes, better ventilation, and a practical starter profile when roasting with an air popper." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://roast-timer.com/how-to/popcorn-popper-safety" />
        <link rel="canonical" href="https://roast-timer.com/how-to/popcorn-popper-safety" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <h1 className="text-4xl font-bold mb-4">Popcorn Popper Safety and Starter Profile</h1>
          <p className="text-lg text-muted-foreground mb-8">
            A safer way to start home roasting with air poppers while still getting useful results.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Non-Negotiable Safety Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Roast outdoors or under very strong ventilation</li>
                  <li>Never leave the popper unattended</li>
                  <li>Keep a metal colander and cooling plan ready before charge</li>
                  <li>Stop immediately if smoke escalates unexpectedly</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Size Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Air poppers are easy to overload, which increases fire risk.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Beginner range: 50-60g</li>
                  <li>Typical working range: 70-85g</li>
                  <li>Hard ceiling: 100g</li>
                </ul>
                <p>Use the Roast Timer batch-size warning as your guardrail.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Starter Profile (Visual Cues)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Without a probe, visual and audio milestones are your best controls.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>0:00-1:30: green to yellow transition</li>
                  <li>1:30-3:30: yellow to light brown (drying/Maillard)</li>
                  <li>3:30-5:00: first crack window on many poppers</li>
                  <li>Drop 60-120 seconds after first crack for light-medium</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Too fast, uneven roast:</strong> lower batch or increase agitation.</p>
                <p><strong>Muted cup:</strong> likely baked from stalled middle phase.</p>
                <p><strong>Harsh smoky cup:</strong> likely overshot development past your target.</p>
                <p>
                  Continue with the full <Link to="/how-to/roasters/popcorn-popper" className="text-primary hover:underline">popcorn popper guide</Link> and compare against <Link to="/how-to/roast-defects" className="text-primary hover:underline">defect patterns</Link>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PopcornPopperSafety;
