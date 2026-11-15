import { Link } from "react-router";
import { FEEDBACK_URL } from "@/components/landing/FeedbackSection";
import { getDoc } from "@/content/docs";
import { SUPPORTED_ROASTERS } from "@/content/siteContent";

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
      ...["getting-started", "first-crack-timing", "roast-defects", "development-ratios"].map((slug) => {
        const doc = getDoc(slug)!;
        return { label: doc.navTitle ?? doc.title, to: doc.path };
      }),
      { label: "All guides", to: "/how-to" },
    ],
  },
  {
    title: "Roasters",
    links: SUPPORTED_ROASTERS.map((r) => ({ label: r.title, to: r.path })),
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
