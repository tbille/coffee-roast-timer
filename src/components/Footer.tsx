import { Link } from "react-router-dom";
import { FEEDBACK_URL } from "@/components/landing/FeedbackSection";

type FooterLink = { label: string; to: string } | { label: string; href: string };

const LINK_GROUPS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Roast",
    links: [
      { label: "Start roasting", to: "/roast" },
      { label: "Discover profiles", to: "/discover" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "Getting started", to: "/how-to/getting-started" },
      { label: "First crack timing", to: "/how-to/first-crack-timing" },
      { label: "Development ratios", to: "/how-to/development-ratios" },
      { label: "Roast defects", to: "/how-to/roast-defects" },
      { label: "All guides", to: "/how-to" },
    ],
  },
  {
    title: "Roasters",
    links: [
      { label: "Gene Cafe CBR-101", to: "/how-to/roasters/gene-cafe-cbr-101" },
      { label: "Behmor 2000AB Plus", to: "/how-to/roasters/behmor-2000ab" },
      { label: "FreshRoast SR800", to: "/how-to/roasters/freshroast-sr800" },
      { label: "Popcorn popper", to: "/how-to/roasters/popcorn-popper" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About", to: "/about" },
      { label: "Share feedback", href: FEEDBACK_URL },
      { label: "Sitemap", href: "/sitemap.xml" },
    ],
  },
];

const LINK_CLASS = "text-sm text-muted-foreground hover:text-foreground hover:underline";

const Footer = () => {
  return (
    <footer className="border-t mt-auto py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold mb-3">{group.title}</h2>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link to={link.to} className={LINK_CLASS}>
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className={LINK_CLASS}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="mt-10 text-sm text-muted-foreground text-center">
          made with love by{" "}
          <a
            href="https://bille.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            toto
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
