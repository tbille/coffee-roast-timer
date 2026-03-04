import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const RoastDefects = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does baked coffee taste like?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Baked coffee often tastes flat, papery, and dull with low sweetness because the roast lost momentum."
        }
      },
      {
        "@type": "Question",
        name: "How do I avoid scorched beans?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Avoid aggressive heat spikes at charge and manage airflow and drum speed to prevent localized overheating."
        }
      },
      {
        "@type": "Question",
        name: "What causes underdeveloped coffee?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Underdevelopment is commonly caused by dropping too soon after first crack or running too little development time."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Coffee Roast Defects: Baked, Scorched, and Underdeveloped</title>
        <meta
          name="description"
          content="Diagnose common coffee roast defects including baked, scorched, and underdeveloped roasts. Learn causes, flavor symptoms, and fixes for your next batch."
        />
        <meta
          name="keywords"
          content="coffee roast defects, baked coffee, scorched beans, underdeveloped roast, roast troubleshooting"
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Coffee Roast Defects: Baked, Scorched, and Underdeveloped" />
        <meta property="og:description" content="Quickly diagnose common roast defects and apply practical fixes to your next batch." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://roast-timer.com/how-to/roast-defects" />
        <link rel="canonical" href="https://roast-timer.com/how-to/roast-defects" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link to="/how-to" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to How To
          </Link>

          <h1 className="text-4xl font-bold mb-4">Roast Defects and How to Fix Them</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Identify flavor problems quickly and adjust your next roast with purpose.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Baked Roast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Tastes like:</strong> flat, bready, low sweetness.</p>
                <p><strong>Common causes:</strong> stalled rate of rise, too much time without enough energy.</p>
                <p><strong>Fix:</strong> keep momentum through Maillard, avoid long coast before first crack.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scorched or Tipped Beans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Tastes like:</strong> bitter, smoky, harsh finish.</p>
                <p><strong>Common causes:</strong> too much charge heat, uneven agitation, excessive conductive heat.</p>
                <p><strong>Fix:</strong> soften early heat curve, improve bean movement, verify batch size.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Underdeveloped Roast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Tastes like:</strong> grassy, sharp sourness, hollow body.</p>
                <p><strong>Common causes:</strong> dropping too soon after first crack.</p>
                <p><strong>Fix:</strong> extend development and target a more consistent post-crack phase.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defect Debug Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Log first crack and drop time every roast</li>
                  <li>Compare defect batches against successful profiles</li>
                  <li>Change one variable at a time: heat, airflow, or batch size</li>
                  <li>Use cupping notes to confirm whether changes helped</li>
                </ul>
                <p>
                  Related guides: <Link to="/how-to/first-crack-timing" className="text-primary hover:underline">first crack timing</Link> and <Link to="/how-to/cupping-notes" className="text-primary hover:underline">cupping notes</Link>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoastDefects;
