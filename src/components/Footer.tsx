import { Link } from "react-router";
import { FEEDBACK_URL } from "@/content/siteContent";
import { useRoasting } from "@/contexts/RoastingContext";

type FooterLink = { label: string; to: string } | { label: string; href: string; external?: boolean };

const LINK_GROUPS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Roast",
    links: [
      { label: "Start a roast", to: "/roast" },
      { label: "My roasts", to: "/roasts" },
      { label: "Discover", to: "/discover" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Getting started", to: "/how-to/getting-started" },
      { label: "First crack timing", to: "/how-to/first-crack-timing" },
      { label: "All guides", to: "/how-to" },
    ],
  },
  {
    title: "Roast Timer",
    links: [
      { label: "About", to: "/about" },
      { label: "Send feedback", href: FEEDBACK_URL, external: true },
      { label: "Sitemap", href: "/sitemap.xml" },
    ],
  },
];

const LINK_CLASS = "text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground hover:underline";

const Footer = () => {
  const { roasting } = useRoasting();
  if (roasting) return null;

  return (
    <footer className="mt-auto border-t px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Footer" className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.title}</h2>
              <ul className="space-y-1.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link to={link.to} className={LINK_CLASS}>
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className={LINK_CLASS}
                        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="mt-8 text-xs text-muted-foreground">
          Made by{" "}
          <a href="https://bille.dev" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:underline">
            toto
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
