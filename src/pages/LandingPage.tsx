import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroSection } from '@/components/landing/HeroSection';
import { LatestRoasts } from '@/components/landing/LatestRoasts';
import { RoasterShowcase } from '@/components/landing/RoasterShowcase';
import { FeedbackSection } from '@/components/landing/FeedbackSection';

const LandingPage = () => {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Coffee Roast Timer",
    url: "https://roast-timer.com",
    description: "Track and improve home coffee roasting with timers, roast profiles, and community discoveries.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://roast-timer.com/discover?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Coffee Roast Timer",
    url: "https://roast-timer.com",
    logo: "https://roast-timer.com/favicon.ico"
  };

  return (
    <>
      <Helmet>
        <title>Coffee Roast Timer: Track Roasts, First Crack, and Roast Profiles</title>
        <meta 
          name="description" 
          content="Track home coffee roasts with event timing, development ratios, and profile history. Supports Gene Cafe, Behmor, FreshRoast, KALDI, Hottop, and popcorn poppers." 
        />
        <meta 
          name="keywords" 
          content="coffee roasting, home coffee roaster, roast timer, Gene Cafe, Behmor, FreshRoast, coffee roast tracking" 
        />
        <meta property="og:title" content="Coffee Roast Timer: Track Roasts, First Crack, and Roast Profiles" />
        <meta 
          property="og:description" 
          content="Track home coffee roasts with event timing, development ratios, and profile history." 
        />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://roast-timer.com" />
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      </Helmet>

      <div className="flex flex-col">
        {/* Hero Section with CTA */}
        <HeroSection />

        {/* Latest Roasts Lane */}
        <LatestRoasts />

        {/* Roaster Showcase Grid */}
        <RoasterShowcase />

        <section className="container mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Roasting Playbooks</h2>
            <p className="text-muted-foreground">
              Practical guides to troubleshoot common roast issues and improve consistency.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">First Crack Timing Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/how-to/first-crack-timing" className="text-primary hover:underline">
                  Learn first crack timing →
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Roast Defects and Fixes</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/how-to/roast-defects" className="text-primary hover:underline">
                  Diagnose roast defects →
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Behmor 2000AB Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/how-to/behmor-2000ab-troubleshooting" className="text-primary hover:underline">
                  Fix Behmor roast issues →
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popcorn Popper Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/how-to/popcorn-popper-safety" className="text-primary hover:underline">
                  Roast safely with an air popper →
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feedback Section */}
        <FeedbackSection />
      </div>
    </>
  );
};

export default LandingPage;
