import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { pageTitle } from "@/components/PageTitle";
import { absoluteUrl } from "@/content/siteContent";

const DESCRIPTION =
  "Why Roast Timer exists: a home roaster with a Gene Cafe CBR-101 who wanted a better roast log than a notebook, and built one for fun.";

const About = () => (
  <>
    <Helmet>
      <title>{pageTitle("About")}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={pageTitle("About")} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={absoluteUrl("/about")} />
      <link rel="canonical" href={absoluteUrl("/about")} />
    </Helmet>

    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <PageHeader title="About" description="Who builds Roast Timer, and why." />

      <div className="prose prose-neutral max-w-none prose-p:leading-relaxed">
        <h2>My coffee journey</h2>
        <p>
          Hi there! I'm toto, a coffee enthusiast who owns a <strong>Gene Cafe CBR-101</strong> home coffee roaster. Like
          many coffee lovers, I wanted to dive deeper into the art and science of coffee roasting to truly understand how
          different variables affect the final cup.
        </p>
        <p>
          What started as curiosity quickly became a passion project. I found myself wanting to track my roasting
          sessions, write down what I changed, and learn from each batch. Rather than using spreadsheets or notebooks, I
          decided to build this small site for fun to digitally track all the roasts I'm making.
        </p>
        <p>
          Today it times my roasts, keeps a record of when first crack came and what I turned on the roaster, and saves
          each batch with its weight loss and notes, with optional temperature logging and curves when I log readings.
          It's become a personal database of my roasting experiments, and a learning tool that combines my love for
          coffee with my passion for building things.
        </p>
        <p>
          It's free, and it works for other machines too. If you roast at home, <Link to="/roast">give it a try</Link>,
          and tell me what's missing with the feedback link at the bottom of the page.
        </p>
      </div>

      <div className="mt-10 border-t pt-6">
        <p className="mb-4 text-sm text-muted-foreground">Want to learn more about my other projects?</p>
        <Button asChild variant="outline">
          <a href="https://bille.dev" target="_blank" rel="noopener noreferrer">
            Visit my website
            <ExternalLink strokeWidth={1.75} aria-hidden />
          </a>
        </Button>
      </div>
    </div>
  </>
);

export default About;
