/**
 * Canonical, framework-free description of the site.
 *
 * This module is imported both by the React app and by vite.config.ts (to
 * generate the static HTML shell, JSON-LD and /llms.txt at build time), so it
 * must not import React, path aliases, or browser-only code.
 */

import { DOCS, type DocEntry } from "./docs";

export const SITE_URL = "https://roast-timer.com";
export const SITE_NAME = "Coffee Roast Timer";

export const SITE_TAGLINE = "Track home coffee roasts, first crack, and roast profiles";

export const SITE_SUMMARY =
  "Coffee Roast Timer is a free web app for home coffee roasters. It times each roast, " +
  "logs events such as first crack and second crack as they happen, calculates the " +
  "development ratio, and saves every batch as a roast profile you can compare, repeat, " +
  "and share. Roasters can also browse profiles from people using the same machine.";

export interface ContentLink {
  title: string;
  path: string;
  description: string;
}

export const HOME_FEATURES: { title: string; text: string }[] = [
  {
    title: "Roast timer with event logging",
    text: "Start a timer and mark first crack, second crack, temperature readings and setting changes as they happen. Bean origin, green and roasted weights, and notes save with the roast.",
  },
  {
    title: "Development ratio and weight loss",
    text: "The app calculates development time after first crack, development ratio, and weight loss so you can see how far each batch was taken.",
  },
  {
    title: "Roast profiles you can repeat",
    text: "Every saved roast becomes a profile with a timeline. Compare two roasts side by side and use a saved profile as the plan for your next batch.",
  },
  {
    title: "Community profiles by roaster",
    text: "Browse first-crack and drop times shared by other home roasters, filtered by roaster model and coffee origin.",
  },
  {
    title: "Cupping notes",
    text: "Record tasting and cupping notes against each roast to connect roast decisions to flavor in the cup.",
  },
];

const toLink = (doc: DocEntry): ContentLink => ({
  title: doc.navTitle ?? doc.title,
  path: doc.path,
  description: doc.description,
});

/** One entry per supported machine (roaster guides only). */
export const SUPPORTED_ROASTERS: ContentLink[] = DOCS.filter((d) => d.kind === "Roaster guide").map(toLink);

/** Every other guide, in reading order. */
export const GUIDES: ContentLink[] = DOCS.filter((d) => d.kind !== "Roaster guide").map((d) => ({
  title: d.title,
  path: d.path,
  description: d.description,
}));

export const MAIN_PAGES: ContentLink[] = [
  {
    title: "Start a roast",
    path: "/roast",
    description: "Open the roast timer and log a new batch.",
  },
  {
    title: "Discover roast profiles",
    path: "/discover",
    description: "Search community roast profiles by roaster and coffee origin.",
  },
  {
    title: "All roasting guides",
    path: "/how-to",
    description: "Every how-to and roaster-specific guide.",
  },
  {
    title: "About",
    path: "/about",
    description: "Why Coffee Roast Timer was built and who maintains it.",
  },
];

export const HOME_FAQ: { question: string; answer: string }[] = [
  {
    question: "What is Coffee Roast Timer?",
    answer:
      "Coffee Roast Timer is a free web app for home coffee roasting. It times your roast, lets you mark first crack, second crack and temperature readings as they happen, and saves each batch as a roast profile you can review and repeat.",
  },
  {
    question: "Is Coffee Roast Timer free?",
    answer:
      "Yes. All core features are free and no credit card is required. You can run the timer without an account; a free account is needed to save roasts and build your profile history.",
  },
  {
    question: "Which coffee roasters are supported?",
    answer:
      "Coffee Roast Timer has dedicated setups for the Gene Cafe CBR-101, Behmor 2000AB Plus, FreshRoast SR800, KALDI Wide, Hottop KN-8828B-2K+, and air popcorn poppers. Any other roaster can be tracked with the general temperature-logging setup.",
  },
  {
    question: "What is a development ratio in coffee roasting?",
    answer:
      "Development ratio is the share of total roast time that happens after first crack begins. For example, 4 minutes of development in a 15 minute roast is a 26.7% development ratio. Coffee Roast Timer calculates it automatically from the first crack and drop times you log.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No. Coffee Roast Timer runs in any modern web browser on a phone, tablet or computer, so you can keep it next to the roaster while you work.",
  },
  {
    question: "Can I see other people's roast profiles?",
    answer:
      "Yes. The Discover page lists roast profiles shared by the community, filterable by roaster model and coffee origin, so you can see typical first crack and drop times on your machine.",
  },
];

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
