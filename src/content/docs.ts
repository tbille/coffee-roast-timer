/**
 * Single source of truth for the guides under /how-to.
 *
 * Drives the docs sidebar, the hub page, previous/next links, the footer,
 * breadcrumbs and the guide lists in siteContent (and therefore the static
 * HTML shell and /llms.txt). Array order is reading order.
 *
 * Framework-free: imported by vite.config.ts via siteContent.
 */

export type DocSectionId = "start" | "tasks" | "roasters" | "concepts";

/** Diátaxis mode of a page, shown above its title. */
export type DocKind = "Tutorial" | "How-to guide" | "Roaster guide" | "Explanation" | "Reference";

export interface DocSection {
  id: DocSectionId;
  title: string;
  blurb: string;
}

export interface DocEntry {
  slug: string;
  path: string;
  section: DocSectionId;
  kind: DocKind;
  /** Page h1 and link text everywhere. */
  title: string;
  /** Shorter label for the sidebar and breadcrumb, when the title is long. */
  navTitle?: string;
  /** <title> tag. */
  seoTitle: string;
  /** Meta description and the one-line summary in lists. */
  description: string;
  /** Intro paragraph under the h1. */
  lede: string;
  readingMinutes: number;
  /** Date the page was last checked against the app (ISO). */
  updated: string;
  related?: string[];
  /** Roaster registry id, for roaster guides. */
  roasterId?: string;
}

export const DOC_SECTIONS: DocSection[] = [
  { id: "start", title: "Start here", blurb: "New to Roast Timer? Log your first roast, start to finish." },
  { id: "tasks", title: "Roast better", blurb: "Step-by-step fixes and workflows once you have a few roasts saved." },
  { id: "roasters", title: "Your roaster", blurb: "Setup, controls and starting numbers for each supported machine." },
  { id: "concepts", title: "Concepts", blurb: "The numbers behind a roast, and why they matter." },
];

const UPDATED = "2026-11-15";

export const DOCS: DocEntry[] = [
  {
    slug: "getting-started",
    path: "/how-to/getting-started",
    section: "start",
    kind: "Tutorial",
    title: "Your first roast with Roast Timer",
    navTitle: "Your first roast",
    seoTitle: "Getting Started: Log Your First Coffee Roast | Coffee Roast Timer",
    description: "Pick your roaster, time a roast, mark first crack and save it as a profile you can repeat.",
    lede: "In about 15 minutes you'll time a real roast, mark first crack as it happens, and save the batch as a profile you can come back to.",
    readingMinutes: 5,
    updated: UPDATED,
    related: ["using-profiles", "first-crack-timing", "roast-numbers"],
  },
  {
    slug: "first-crack-timing",
    path: "/how-to/first-crack-timing",
    section: "tasks",
    kind: "How-to guide",
    title: "Fix early or late first crack",
    navTitle: "Fix first crack timing",
    seoTitle: "First Crack Timing: Fix Early or Late First Crack | Coffee Roast Timer",
    description: "Find your first crack window, then adjust heat, airflow and batch size when it comes too early or too late.",
    lede: "First crack is the most reliable landmark in a roast. Hit it at the same time every batch and most of your consistency problems go away.",
    readingMinutes: 4,
    updated: UPDATED,
    related: ["development-ratios", "roast-defects"],
  },
  {
    slug: "roast-defects",
    path: "/how-to/roast-defects",
    section: "tasks",
    kind: "How-to guide",
    title: "Diagnose a roast defect",
    navTitle: "Diagnose a defect",
    seoTitle: "Roast Defects: Baked, Scorched, Tipped and Underdeveloped Coffee | Coffee Roast Timer",
    description: "Match what you taste and see to a likely cause, then change one thing on the next roast.",
    lede: "Start from what's wrong in the cup or on the bean, find the likely cause, and change one variable next time.",
    readingMinutes: 4,
    updated: UPDATED,
    related: ["first-crack-timing", "cupping-notes", "development-ratios"],
  },
  {
    slug: "using-profiles",
    path: "/how-to/using-profiles",
    section: "tasks",
    kind: "How-to guide",
    title: "Repeat or compare a roast",
    seoTitle: "Repeat a Coffee Roast Using a Saved Profile | Coffee Roast Timer",
    description: "Use a saved profile as your plan for the next batch, and compare two roasts side by side.",
    lede: "A saved profile is a record of what you did. Use it as the plan for your next batch, then compare the two to see what changed.",
    readingMinutes: 5,
    updated: UPDATED,
    related: ["cupping-notes", "first-crack-timing", "development-ratios"],
  },
  {
    slug: "cupping-notes",
    path: "/how-to/cupping-notes",
    section: "tasks",
    kind: "How-to guide",
    title: "Add tasting notes to a roast",
    navTitle: "Add tasting notes",
    seoTitle: "Add Cupping and Tasting Notes to a Roast | Coffee Roast Timer",
    description: "Score a roast, tag its flavors and link what you taste back to how you roasted it.",
    lede: "The timer tells you what you did. Tasting notes tell you whether it worked. Together they show you what to change.",
    readingMinutes: 4,
    updated: UPDATED,
    related: ["roast-defects", "using-profiles"],
  },
  {
    slug: "gene-cafe-cbr-101",
    roasterId: "gene-cbr-101",
    path: "/how-to/roasters/gene-cafe-cbr-101",
    section: "roasters",
    kind: "Roaster guide",
    title: "Roasting on the Gene Cafe CBR-101",
    navTitle: "Gene Cafe CBR-101",
    seoTitle: "Gene Cafe CBR-101 Roasting Guide | Coffee Roast Timer",
    description: "Batch size, temperature settings and how to log a Gene Cafe roast in Roast Timer.",
    lede: "The Gene Cafe is an off-axis drum roaster where you set a target air temperature and watch the beans through a clear drum.",
    readingMinutes: 4,
    updated: UPDATED,
    related: ["first-crack-timing", "using-profiles"],
  },
  {
    slug: "behmor-2000ab",
    roasterId: "behmor-2000ab",
    path: "/how-to/roasters/behmor-2000ab",
    section: "roasters",
    kind: "Roaster guide",
    title: "Roasting on the Behmor 2000AB Plus",
    navTitle: "Behmor 2000AB Plus",
    seoTitle: "Behmor 2000AB Plus Roasting Guide | Coffee Roast Timer",
    description: "Profiles, extensions and the 75% prompt: how to log a Behmor roast in Roast Timer.",
    lede: "The Behmor is a drum roaster that runs a preset heat profile and counts down. You steer it with the profile you pick and the time you add.",
    readingMinutes: 4,
    updated: UPDATED,
    related: ["behmor-2000ab-troubleshooting", "first-crack-timing"],
  },
  {
    slug: "behmor-2000ab-troubleshooting",
    path: "/how-to/behmor-2000ab-troubleshooting",
    section: "roasters",
    kind: "How-to guide",
    title: "Troubleshoot a Behmor roast",
    navTitle: "Behmor troubleshooting",
    seoTitle: "Behmor 2000AB Troubleshooting: Late First Crack, Stalls, Err 7 | Coffee Roast Timer",
    description: "Fix late first crack, stalled roasts, uneven color and the Err 7 shutdown on a Behmor 2000AB.",
    lede: "Most Behmor problems come down to batch size, starting conditions or when you add time. Find your symptom below.",
    readingMinutes: 3,
    updated: UPDATED,
    related: ["behmor-2000ab", "first-crack-timing", "roast-defects"],
  },
  {
    slug: "freshroast-sr800",
    roasterId: "freshroast-sr800",
    path: "/how-to/roasters/freshroast-sr800",
    section: "roasters",
    kind: "Roaster guide",
    title: "Roasting on the FreshRoast SR800",
    navTitle: "FreshRoast SR800",
    seoTitle: "FreshRoast SR800 Roasting Guide | Coffee Roast Timer",
    description: "Batch size, a starting heat and fan schedule, and how to log SR800 changes in Roast Timer.",
    lede: "The SR800 is a fluid-bed air roaster: hot air both heats and moves the beans. You steer it with two dials, heat and fan.",
    readingMinutes: 4,
    updated: UPDATED,
    related: ["first-crack-timing", "using-profiles"],
  },
  {
    slug: "kaldi-wide",
    roasterId: "kaldi-wide",
    path: "/how-to/roasters/kaldi-wide",
    section: "roasters",
    kind: "Roaster guide",
    title: "Roasting on the KALDI Wide",
    navTitle: "KALDI Wide",
    seoTitle: "KALDI Wide Roasting Guide with Voice Logging | Coffee Roast Timer",
    description: "Gas setup, temperature logging by voice or auto-record, and how to log a KALDI Wide roast.",
    lede: "The KALDI Wide is a gas-fired drum roaster with a motorized drum. You control it with the flame, and log temperatures without taking your eyes off the burner.",
    readingMinutes: 4,
    updated: UPDATED,
    related: ["first-crack-timing", "roast-defects"],
  },
  {
    slug: "hottop-kn-8828",
    roasterId: "hottop-kn8828",
    path: "/how-to/roasters/hottop-kn-8828",
    section: "roasters",
    kind: "Roaster guide",
    title: "Roasting on the Hottop KN-8828B-2K+",
    navTitle: "Hottop KN-8828B-2K+",
    seoTitle: "Hottop KN-8828B-2K+ Roasting Guide with Rate of Rise | Coffee Roast Timer",
    description: "Auto and manual modes, logging bean temperature, and reading rate of rise for a Hottop roast.",
    lede: "The Hottop is a programmable drum roaster with a bean probe. Roast Timer turns your temperature readings into a live rate of rise.",
    readingMinutes: 5,
    updated: UPDATED,
    related: ["roast-numbers", "first-crack-timing"],
  },
  {
    slug: "popcorn-popper",
    roasterId: "popcorn-popper",
    path: "/how-to/roasters/popcorn-popper",
    section: "roasters",
    kind: "Roaster guide",
    title: "Roasting in an air popcorn popper",
    navTitle: "Air popcorn popper",
    seoTitle: "How to Roast Coffee in an Air Popcorn Popper | Coffee Roast Timer",
    description: "Batch size, color cues and how to log a fast popcorn popper roast in Roast Timer.",
    lede: "A hot-air popcorn popper is the cheapest way to start roasting. It's fast and hard to control, so you'll lean on your eyes and ears.",
    readingMinutes: 4,
    updated: UPDATED,
    related: ["popcorn-popper-safety", "first-crack-timing"],
  },
  {
    slug: "popcorn-popper-safety",
    path: "/how-to/popcorn-popper-safety",
    section: "roasters",
    kind: "How-to guide",
    title: "Popcorn popper safety checklist",
    navTitle: "Popcorn popper safety",
    seoTitle: "Popcorn Popper Coffee Roasting Safety Checklist | Coffee Roast Timer",
    description: "Batch limits, ventilation and what to do if something goes wrong when roasting in a popcorn popper.",
    lede: "Popcorn poppers weren't built for coffee. Run through this checklist before every roast.",
    readingMinutes: 2,
    updated: UPDATED,
    related: ["popcorn-popper"],
  },
  {
    slug: "development-ratios",
    path: "/how-to/development-ratios",
    section: "concepts",
    kind: "Explanation",
    title: "What development ratio tells you",
    navTitle: "Development ratio",
    seoTitle: "Development Ratio (DTR) in Coffee Roasting Explained | Coffee Roast Timer",
    description: "What development ratio is, how it's calculated, what ranges mean, and where it stops being useful.",
    lede: "Development ratio is the share of the roast that happens after first crack. It's a useful way to compare roasts, as long as you know its limits.",
    readingMinutes: 5,
    updated: UPDATED,
    related: ["roast-numbers", "first-crack-timing", "roast-defects"],
  },
  {
    slug: "roast-numbers",
    path: "/how-to/roast-numbers",
    section: "concepts",
    kind: "Reference",
    title: "Roast numbers glossary",
    navTitle: "Glossary",
    seoTitle: "Coffee Roasting Glossary: First Crack, DTR, Weight Loss, RoR | Coffee Roast Timer",
    description: "Every number Roast Timer shows, what it means and where to find it in the app.",
    lede: "Every number Roast Timer records or calculates, in one place.",
    readingMinutes: 3,
    updated: UPDATED,
    related: ["development-ratios", "getting-started"],
  },
];

export const getDoc = (slug: string) => DOCS.find((d) => d.slug === slug);

export const getSection = (id: DocSectionId) => DOC_SECTIONS.find((s) => s.id === id)!;

export const docsBySection = () =>
  Object.fromEntries(DOC_SECTIONS.map((s) => [s.id, DOCS.filter((d) => d.section === s.id)])) as Record<
    DocSectionId,
    DocEntry[]
  >;

/** Previous/next in sidebar reading order. */
export const getAdjacent = (slug: string) => {
  const ordered = DOC_SECTIONS.flatMap((s) => DOCS.filter((d) => d.section === s.id));
  const i = ordered.findIndex((d) => d.slug === slug);
  return { prev: i > 0 ? ordered[i - 1] : undefined, next: i >= 0 ? ordered[i + 1] : undefined };
};
