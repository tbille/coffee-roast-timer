/**
 * Build-time renderers that turn siteContent into crawler-readable output.
 *
 * Used by vite.config.ts only. The app is client-rendered, so without this
 * the HTML served to crawlers that don't run JavaScript (most LLM crawlers
 * and answer engines) is an empty <div id="root">.
 */
import {
  GUIDES,
  HOME_FAQ,
  HOME_FEATURES,
  MAIN_PAGES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SEO_NAME,
  SITE_SUMMARY,
  SITE_TAGLINE,
  SITE_URL,
  SUPPORTED_ROASTERS,
  absoluteUrl,
  type ContentLink,
} from "./siteContent.ts";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Prevent "</script>" inside JSON from closing the tag early.
const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

const linkList = (links: ContentLink[]) =>
  `<ul class="mt-3 space-y-2">${links
    .map(
      (link) =>
        `<li><a class="text-primary hover:underline font-medium" href="${link.path}">${escapeHtml(
          link.title,
        )}</a><span class="text-muted-foreground"> — ${escapeHtml(link.description)}</span></li>`,
    )
    .join("")}</ul>`;

/**
 * Semantic HTML injected inside <div id="root">. React replaces it on mount,
 * so it is only ever seen before JavaScript runs (crawlers, slow networks).
 * The eyebrow, <h1> and lead copy match the React hero so the swap reads as one page.
 */
export function renderStaticShell(): string {
  return `
      <div class="min-h-screen flex flex-col" data-static-shell>
        <header class="border-b px-4 py-4">
          <nav aria-label="Main" class="container mx-auto max-w-6xl flex flex-wrap gap-4 items-center">
            <a href="/" class="font-bold">${SITE_NAME}</a>
            ${MAIN_PAGES.map((p) => `<a href="${p.path}" class="text-sm text-muted-foreground hover:underline">${escapeHtml(p.title)}</a>`).join("\n            ")}
          </nav>
        </header>
        <main class="flex-1 container mx-auto max-w-6xl px-4 py-12 space-y-12">
          <section>
            <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Free · works in your browser · no account needed</p>
            <h1 class="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">The roast companion for home roasters</h1>
            <p class="mt-4 text-lg text-muted-foreground max-w-2xl">A clock you can read from across the garage, one tap for first crack, and every batch saved so you can roast it again.</p>
            <p class="mt-4 text-muted-foreground max-w-2xl">${escapeHtml(SITE_SUMMARY)}</p>
            <p class="mt-6"><a href="/roast" class="text-primary font-semibold hover:underline">Start roasting</a> · <a href="/discover" class="text-primary hover:underline">Browse community roasts</a></p>
          </section>
          <section>
            <h2 class="text-2xl font-semibold">Roast, review, repeat</h2>
            <ul class="mt-3 space-y-3">
              ${HOME_FEATURES.map((f) => `<li><h3 class="font-semibold">${escapeHtml(f.title)}</h3><p class="text-muted-foreground">${escapeHtml(f.text)}</p></li>`).join("\n              ")}
            </ul>
          </section>
          <section>
            <h2 class="text-2xl font-semibold">Supported home coffee roasters</h2>
            ${linkList(SUPPORTED_ROASTERS)}
          </section>
          <section>
            <h2 class="text-2xl font-semibold">Roasting guides</h2>
            ${linkList(GUIDES)}
          </section>
          <section>
            <h2 class="text-2xl font-semibold">Questions people ask</h2>
            <dl class="mt-3 space-y-4">
              ${HOME_FAQ.map((q) => `<div><dt class="font-semibold">${escapeHtml(q.question)}</dt><dd class="text-muted-foreground">${escapeHtml(q.answer)}</dd></div>`).join("\n              ")}
            </dl>
          </section>
        </main>
        <noscript><p class="px-4 pb-8 text-muted-foreground">The roast timer needs JavaScript. The guides above can be read without it.</p></noscript>
      </div>`;
}

/**
 * Site-wide JSON-LD. index.html is served for every route, so only include
 * entities that are true on every page (no FAQPage here — that lives in the
 * homepage's Helmet, next to the visible FAQ).
 */
export function renderSiteJsonLd(): string {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: SITE_SEO_NAME,
        url: SITE_URL,
        description: SITE_SUMMARY,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/discover?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.ico`,
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: absoluteUrl("/roast"),
        description: SITE_SUMMARY,
        applicationCategory: "UtilitiesApplication",
        applicationSubCategory: "Coffee roasting tracker",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: HOME_FEATURES.map((f) => f.title),
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
  return `<script type="application/ld+json">${safeJson(graph)}</script>`;
}

export function homeFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

const mdLinks = (links: ContentLink[]) =>
  links.map((l) => `- [${l.title}](${absoluteUrl(l.path)}): ${l.description}`).join("\n");

/** /llms.txt — see https://llmstxt.org */
export function renderLlmsTxt(): string {
  return `# ${SITE_NAME}

> ${SITE_TAGLINE}. ${SITE_DESCRIPTION}

${SITE_SUMMARY}

The app is client-rendered; the pages below are the canonical sources. Everything is free, and the timer works without an account. Saved roasts are private unless their roaster makes them link-only or public on Discover.

## Features

${HOME_FEATURES.map((f) => `- **${f.title}**: ${f.text}`).join("\n")}

## Main pages

${mdLinks(MAIN_PAGES)}

## Supported roasters

${mdLinks(SUPPORTED_ROASTERS)}

## Guides

${mdLinks(GUIDES)}

## FAQ

${HOME_FAQ.map((q) => `### ${q.question}\n\n${q.answer}`).join("\n\n")}

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml): Every public page, including community roasts.
`;
}
