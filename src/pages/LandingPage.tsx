import { Helmet } from 'react-helmet-async';
import { HeroSection } from '@/components/landing/HeroSection';
import { LatestRoasts } from '@/components/landing/LatestRoasts';
import { RoasterShowcase } from '@/components/landing/RoasterShowcase';
import { FeedbackSection } from '@/components/landing/FeedbackSection';

const LandingPage = () => {
  return (
    <>
      <Helmet>
        <title>Coffee Roast Timer - Perfect Your Home Coffee Roasting</title>
        <meta 
          name="description" 
          content="Track your coffee roasts with precision. Support for 6 popular roasters including Gene Cafe, Behmor, FreshRoast. Browse community profiles." 
        />
        <meta 
          name="keywords" 
          content="coffee roasting, home coffee roaster, roast timer, Gene Cafe, Behmor, FreshRoast, coffee roast tracking" 
        />
        <meta property="og:title" content="Coffee Roast Timer - Perfect Your Home Coffee Roasting" />
        <meta 
          property="og:description" 
          content="Track your coffee roasts with precision. Support for 6 popular roasters. Browse community profiles." 
        />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://roast-timer.com" />
      </Helmet>

      <div className="flex flex-col">
        {/* Hero Section with CTA */}
        <HeroSection />

        {/* Latest Roasts Lane */}
        <LatestRoasts />

        {/* Roaster Showcase Grid */}
        <RoasterShowcase />

        {/* Feedback Section */}
        <FeedbackSection />
      </div>
    </>
  );
};

export default LandingPage;
