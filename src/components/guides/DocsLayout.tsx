import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { JsonLd } from "@/components/JsonLd";
import { Link, NavLink } from "react-router";
import { ArrowLeft, ArrowRight, ChevronDown, Clock, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { DOC_SECTIONS, docsBySection, getAdjacent, getDoc, getSection, type DocEntry } from "@/content/docs";
import { SITE_NAME, absoluteUrl } from "@/content/siteContent";

export function DocsSidebar({ currentSlug, onNavigate }: { currentSlug?: string; onNavigate?: () => void }) {
  const groups = docsBySection();
  return (
    <nav aria-label="Learn" className="text-sm">
      <NavLink
        to="/how-to"
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "mb-6 block rounded-md px-2 py-1.5 font-medium hover:bg-muted",
            isActive ? "bg-secondary text-secondary-foreground" : "text-foreground",
          )
        }
      >
        All guides
      </NavLink>
      {DOC_SECTIONS.map((section) => (
        <div key={section.id} className="mb-6">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {groups[section.id].map((doc) => {
              const active = doc.slug === currentSlug;
              return (
                <li key={doc.slug}>
                  <Link
                    to={doc.path}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-2 py-2 leading-snug transition-colors lg:py-1.5",
                      active
                        ? "bg-secondary font-medium text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {doc.navTitle ?? doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function MobileGuidesMenu({ currentSlug }: { currentSlug?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="mb-6 lg:hidden">
          <Menu className="mr-2 h-4 w-4" strokeWidth={1.75} aria-hidden />
          All guides
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle>Learn</SheetTitle>
        </SheetHeader>
        <DocsSidebar currentSlug={currentSlug} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

type TocItem = { id: string; text: string; level: 2 | 3 };

function useArticleHeadings(slug: string) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    const article = document.querySelector("[data-docs-article]");
    if (!article) return;
    // Only top-level section headings: Step titles are h3s without ids.
    const headings = Array.from(article.querySelectorAll<HTMLElement>("h2[id]"));
    setItems(
      headings.map((h) => ({
        id: h.id,
        text: (h.textContent ?? "").replace(/#$/, "").trim(),
        level: 2,
      })),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [slug]);

  return { items, activeId };
}

function TocLinks({ items, activeId }: { items: TocItem[]; activeId?: string }) {
  return (
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={cn(
              "-ml-px block border-l-2 py-1 pl-3 leading-snug transition-colors",
              item.id === activeId
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

function DocsPager({ slug }: { slug: string }) {
  const { prev, next } = getAdjacent(slug);
  if (!prev && !next) return null;
  return (
    <nav aria-label="Previous and next guide" className="mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2">
      {prev ? (
        <Link to={prev.path} className="group rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/50">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="h-3 w-3" strokeWidth={1.75} aria-hidden /> Previous
          </span>
          <span className="mt-1 block font-medium group-hover:text-primary">{prev.title}</span>
        </Link>
      ) : null}
      {next ? (
        <Link
          to={next.path}
          className="group rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/50 sm:col-start-2 sm:text-right"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
            Next <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="mt-1 block font-medium group-hover:text-primary">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}

function DocsRelated({ doc }: { doc: DocEntry }) {
  const related = (doc.related ?? []).map(getDoc).filter((d): d is DocEntry => Boolean(d));
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related-guides" className="mt-14">
      <h2 id="related-guides" className="text-lg font-semibold tracking-tight">
        Related guides
      </h2>
      <ul className="mt-3 divide-y border-y">
        {related.map((r) => (
          <li key={r.slug}>
            <Link to={r.path} className="group flex items-start justify-between gap-4 py-3">
              <span>
                <span className="block font-medium group-hover:text-primary">{r.title}</span>
                <span className="block text-sm text-muted-foreground">{r.description}</span>
              </span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" strokeWidth={1.75} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const formatUpdated = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

/**
 * Shell for every guide: SEO tags, breadcrumb, sidebar, header, article,
 * "on this page" table of contents, related guides, and previous/next.
 */
export function DocsLayout({
  slug,
  children,
  schemas = [],
}: {
  slug: string;
  children: ReactNode;
  /** Extra JSON-LD objects (FAQPage, HowTo) for this page. */
  schemas?: object[];
}) {
  const doc = getDoc(slug);
  if (!doc) throw new Error(`Unknown doc slug: ${slug}`);
  const section = getSection(doc.section);
  const { items, activeId } = useArticleHeadings(slug);
  const url = absoluteUrl(doc.path);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Learn", item: absoluteUrl("/how-to") },
      { "@type": "ListItem", position: 3, name: doc.title, item: url },
    ],
  };
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: doc.title,
    description: doc.description,
    url,
    ...(doc.updated ? { dateModified: doc.updated } : {}),
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
  };

  return (
    <>
      <Helmet>
        <title>{doc.seoTitle}</title>
        <meta name="description" content={doc.description} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={doc.seoTitle} />
        <meta property="og:description" content={doc.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <link rel="canonical" href={url} />
      </Helmet>
      {[breadcrumbSchema, articleSchema, ...schemas].map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12 lg:py-12 xl:grid-cols-[13rem_minmax(0,1fr)_12rem]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <DocsSidebar currentSlug={slug} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mx-auto max-w-[68ch] xl:mx-0">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/how-to">Learn</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/how-to#${section.id}`}>{section.title}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <BreadcrumbPage>{doc.navTitle ?? doc.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <MobileGuidesMenu currentSlug={slug} />

            <header className="mb-8 border-b pb-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{doc.kind}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{doc.title}</h1>
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{doc.lede}</p>
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  {doc.readingMinutes} min read
                </span>
                {doc.updated ? <span>Updated {formatUpdated(doc.updated)}</span> : null}
              </p>
            </header>

            {items.length >= 3 ? (
              <Collapsible className="mb-8 rounded-md border px-4 py-3 xl:hidden">
                <CollapsibleTrigger className="group flex w-full items-center justify-between text-sm font-medium">
                  On this page
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" strokeWidth={1.75} aria-hidden />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <TocLinks items={items} activeId={activeId} />
                </CollapsibleContent>
              </Collapsible>
            ) : null}

            <article
              data-docs-article
              className="prose prose-neutral max-w-none prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h3:text-lg prose-a:font-medium prose-a:underline-offset-4 prose-li:my-1 prose-strong:font-semibold"
            >
              {children}
            </article>

            <DocsRelated doc={doc} />
            <DocsPager slug={slug} />
          </div>
        </div>

        {items.length >= 3 ? (
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
              <div className="border-l">
                <TocLinks items={items} activeId={activeId} />
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </>
  );
}
