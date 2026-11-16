import { Link, useLocation } from "react-router";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { pageTitle } from "@/components/PageTitle";

const LINKS = [
  { to: "/roast", label: "Start a roast" },
  { to: "/roasts", label: "My roasts" },
  { to: "/discover", label: "Discover community roasts" },
  { to: "/how-to", label: "Roasting guides" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>{pageTitle("Page not found")}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
        <PageHeader
          eyebrow="404"
          title="Page not found"
          description={
            <>
              There's nothing at <span className="break-all font-mono text-sm">{location.pathname}</span>. The link may be
              old, or the roast may have been deleted.
            </>
          }
        />
        <Button asChild>
          <Link to="/">Back to the home page</Link>
        </Button>
        <ul className="mt-10 divide-y border-y">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="group flex items-center justify-between gap-4 py-3 font-medium hover:text-primary">
                {l.label}
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" strokeWidth={1.75} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default NotFound;
