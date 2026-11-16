import { Helmet } from "react-helmet-async";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "react-router";
import { ArrowRight, BookOpen, ChevronRight, Compass, Flame, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DocsSidebar } from "@/components/guides/DocsLayout";
import { PageHeader } from "@/components/ui/page-header";
import { DOC_SECTIONS, DOCS, docsBySection, getDoc, type DocEntry, type DocSectionId } from "@/content/docs";
import { absoluteUrl } from "@/content/siteContent";

const SECTION_ICONS: Record<DocSectionId, LucideIcon> = {
  start: Compass,
  tasks: Wrench,
  roasters: Flame,
  concepts: BookOpen,
};

function GuideRow({ doc }: { doc: DocEntry }) {
  return (
    <li>
      <Link to={doc.path} className="group flex items-start justify-between gap-4 py-4">
        <span className="min-w-0">
          <span className="block font-medium text-foreground group-hover:text-primary">{doc.title}</span>
          <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{doc.description}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 pt-0.5 text-xs text-muted-foreground">
          <span className="hidden sm:inline">{doc.readingMinutes} min</span>
          <ChevronRight className="h-4 w-4 group-hover:text-primary" strokeWidth={1.75} aria-hidden />
        </span>
      </Link>
    </li>
  );
}

function RoasterTile({ doc }: { doc: DocEntry }) {
  const extras = DOCS.filter((d) => d.section === "roasters" && !d.roasterId && d.related?.includes(doc.slug));
  return (
    <li className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/40">
      <Link to={doc.path} className="font-medium hover:text-primary">
        {doc.navTitle ?? doc.title}
      </Link>
      {extras.map((extra) => (
        <Link
          key={extra.slug}
          to={extra.path}
          className="mt-2 block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {extra.navTitle ?? extra.title}
        </Link>
      ))}
    </li>
  );
}

const HowTo = () => {
  const groups = docsBySection();
  const firstRoast = getDoc("getting-started")!;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Learn", item: absoluteUrl("/how-to") },
    ],
  };
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Home coffee roasting guides",
    itemListElement: DOC_SECTIONS.flatMap((s) => groups[s.id]).map((doc, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(doc.path),
      name: doc.title,
    })),
  };

  return (
    <>
      <Helmet>
        <title>Home coffee roasting guides: first crack, defects and roaster setup · Roast Timer</title>
        <meta
          name="description"
          content="Guides for home coffee roasting with Roast Timer: log your first roast, fix first crack timing and defects, and set up a Gene Cafe, Behmor, FreshRoast, KALDI, Hottop or popcorn popper."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Home coffee roasting guides · Roast Timer" />
        <meta
          property="og:description"
          content="Practical home roasting guides: your first roast, troubleshooting, and roaster-specific setup."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={absoluteUrl("/how-to")} />
        <link rel="canonical" href={absoluteUrl("/how-to")} />
      </Helmet>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12 lg:py-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <DocsSidebar />
          </div>
        </aside>

        <div className="min-w-0 max-w-3xl">
          <PageHeader
            className="pb-0"
            eyebrow="Learn"
            title="Roasting guides"
            description="Practical help for home roasters, from your first batch to dialing in a coffee you love. Written for Roast Timer, but most of it applies to any roast."
          />

          <Link
            to={firstRoast.path}
            className="group mt-8 flex items-center justify-between gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <span>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">New here? Start with</span>
              <span className="mt-0.5 block text-lg font-semibold text-foreground">{firstRoast.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{firstRoast.description}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
          </Link>

          <nav aria-label="Guide sections" className="mt-6 grid gap-3 sm:grid-cols-3">
            {DOC_SECTIONS.filter((s) => s.id !== "start").map((section) => {
              const Icon = SECTION_ICONS[section.id];
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group rounded-lg border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} aria-hidden />
                  <span className="mt-2 block font-medium group-hover:text-primary">{section.title}</span>
                  <span className="mt-1 block text-sm leading-snug text-muted-foreground">{section.blurb}</span>
                </a>
              );
            })}
          </nav>

          {DOC_SECTIONS.filter((s) => s.id !== "start").map((section) => (
            <section key={section.id} aria-labelledby={section.id} className="mt-14 scroll-mt-24" id={`${section.id}-section`}>
              <h2 id={section.id} className="scroll-mt-24 text-2xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <p className="mt-1 text-muted-foreground">{section.blurb}</p>
              {section.id === "roasters" ? (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {groups.roasters
                    .filter((d) => d.roasterId)
                    .map((doc) => (
                      <RoasterTile key={doc.slug} doc={doc} />
                    ))}
                </ul>
              ) : (
                <ul className="mt-4 divide-y border-y">
                  {groups[section.id].map((doc) => (
                    <GuideRow key={doc.slug} doc={doc} />
                  ))}
                </ul>
              )}
            </section>
          ))}

          <p className="mt-14 text-sm text-muted-foreground">
            Spotted something missing or out of date? Say so with the feedback link at the bottom of the page.
          </p>
        </div>
      </div>
    </>
  );
};

export default HowTo;
