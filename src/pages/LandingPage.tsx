import { Helmet } from "react-helmet-async";
import { Hero } from "@/components/landing/Hero";
import { ValueProps } from "@/components/landing/ValueProps";
import { MachinesGrid } from "@/components/landing/MachinesGrid";
import { LatestRoasts } from "@/components/landing/LatestRoasts";
import { HomeFaq } from "@/components/landing/HomeFaq";
import { homeFaqJsonLd } from "@/content/staticShell";
import { SITE_DESCRIPTION, SITE_SEO_NAME, SITE_URL } from "@/content/siteContent";

const TITLE = `${SITE_SEO_NAME}: the roast companion for home roasters`;

/** Promise (hero) → proof (the real roast screen, value props, machines) → path (latest roasts, FAQ). */
const LandingPage = () => (
  <>
    <Helmet>
      <title>{TITLE}</title>
      <meta name="description" content={SITE_DESCRIPTION} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={SITE_DESCRIPTION} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
      <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={SITE_URL} />
      {/* WebSite / Organization / WebApplication JSON-LD is static in index.html (src/content/staticShell.ts). */}
      <script type="application/ld+json">{JSON.stringify(homeFaqJsonLd())}</script>
    </Helmet>

    <Hero />
    <ValueProps />
    <MachinesGrid />
    <LatestRoasts />
    <HomeFaq />
  </>
);

export default LandingPage;
