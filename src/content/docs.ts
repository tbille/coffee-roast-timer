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
  { id: "start", title: "Start here", blurb: "New to Roast Timer? Log your first roast, from charge to drop." },
  { id: "tasks", title: "Roast better", blurb: "Step-by-step fixes and workflows once you have a few roasts saved." },
  { id: "roasters", title: "Your roaster", blurb: "Setup, controls and starting numbers for each supported machine." },
  { id: "concepts", title: "Concepts", blurb: "The numbers behind a roast, and why they matter." },
];

const UPDATED = "2026-11-16";

export const DOCS: DocEntry[] = [
  {
    slug: "getting-started",
    path: "/how-to/getting-started",
    section: "start",
    kind: "Tutorial",
    title: "Your first roast with Roast Timer",
    navTitle: "Your first roast",
    seoTitle: "Your first coffee roast, step by step · Roast Timer",
    description: "Pick your roaster, charge, tap yellowing, first crack and drop, then save the roast so you can roast it again.",
    lede: "In about 15 minutes you'll time a real roast, tap each moment as it happens, and save the batch on the post-roast card so you can roast it again.",
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
    seoTitle: "First crack timing: fix early or late first crack · Roast Timer",
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
    seoTitle: "Roast defects: baked, scorched, tipped and underdeveloped coffee · Roast Timer",
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
    title: "Roast it again, or compare two roasts",
    navTitle: "Roast it again",
    seoTitle: "Roast it again: follow a saved coffee roast as a reference · Roast Timer",
    description: "Follow a saved roast as a live reference with Roast again, then compare the two side by side.",
    lede: "A saved roast is a record of what you did. Follow it as a reference on your next batch, then compare the two to see what changed.",
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
    seoTitle: "Add cupping and tasting notes to a roast · Roast Timer",
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
    seoTitle: "Gene Cafe CBR-101 roasting guide · Roast Timer",
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
    seoTitle: "Behmor 2000AB Plus roasting guide · Roast Timer",
    description: "Weight button, programs P1–P5, added time and the 75% prompt: how to log a Behmor roast in Roast Timer.",
    lede: "The Behmor is a drum roaster that counts down from a time set by the weight button and runs the heat program you pick. You steer it with the program, the time you add, and manual mode.",
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
    seoTitle: "Behmor 2000AB troubleshooting: late first crack, stalls, Err 7 · Roast Timer",
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
    seoTitle: "FreshRoast SR800 roasting guide: heat and fan 1–9 · Roast Timer",
    description: "Batch size, a starting heat and fan schedule on the 1–9 dials, and how to log SR800 changes in Roast Timer.",
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
    seoTitle: "KALDI Wide roasting guide · Roast Timer",
    description: "Gas setup, flame changes, temperature logging by voice or typing, and how to log a KALDI Wide roast.",
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
    seoTitle: "Hottop KN-8828B-2K+ roasting guide · Roast Timer",
    description: "Heat and fan in percent, logging bean temperature, and reading rate of rise for a Hottop roast.",
    lede: "The Hottop is a programmable drum roaster with a bean probe. Log heat and fan the way the roaster shows them, and your bean readings become a curve.",
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
    seoTitle: "How to roast coffee in an air popcorn popper · Roast Timer",
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
    seoTitle: "Popcorn popper coffee roasting safety checklist · Roast Timer",
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
    seoTitle: "Development ratio (DTR) in coffee roasting, explained · Roast Timer",
    description: "What development ratio is, how it's calculated, typical starting points by roaster type, and where it stops being useful.",
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
    seoTitle: "Coffee roasting glossary: charge, first crack, development, weight loss · Roast Timer",
    description: "Charge, turning point, yellowing, first crack, development, drop, weight loss and roast level: every term Roast Timer uses.",
    lede: "Every moment you can tap and every number Roast Timer records or calculates, in one place.",
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
