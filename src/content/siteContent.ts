/**
 * Canonical, framework-free description of the site.
 *
 * This module is imported both by the React app and by vite.config.ts (to
 * generate the static HTML shell, JSON-LD and /llms.txt at build time), so it
 * must not import React, path aliases, or browser-only code.
 */

import { DOCS, type DocEntry } from "./docs.ts";

export const SITE_URL = "https://roast-timer.com";
export const SITE_NAME = "Roast Timer";
/** Longer form used only where search titles benefit (the home <title>). */
export const SITE_SEO_NAME = "Coffee Roast Timer";

export const SITE_TAGLINE = "The roast companion for home coffee roasters";

/** Short pitch used in meta descriptions. */
export const SITE_DESCRIPTION =
  "A free roast timer for home coffee roasters: a big clock, one tap for first crack, controls that match your machine, and every batch saved so you can roast it again.";

export const SITE_SUMMARY =
  "Roast Timer is a free web app for home coffee roasters. It runs in the browser with no account needed: " +
  "a big clock, one tap each for yellowing, first crack and drop, a live phase ribbon, and controls that match " +
  "the Gene Cafe CBR-101, Behmor 2000AB Plus, FreshRoast SR800, KALDI Wide, Hottop KN-8828B-2K+ and air " +
  "popcorn poppers. After the drop it saves the roast with weight loss, development time and notes, and any " +
  "saved roast can be followed live as a reference for the next batch.";

/** Where the footer "Send feedback" link points. */
export const FEEDBACK_URL = "https://forms.gle/RE2Dt1DF9yRLoZ9m9";

export interface ContentLink {
  title: string;
  path: string;
  description: string;
}

export const HOME_FEATURES: { title: string; text: string }[] = [
  {
    title: "A roast screen you can read from across the room",
    text: "A huge clock, a phase ribbon for drying, Maillard and development that fills in from the moments you tap, and one big button for the next one: yellowing, first crack, drop. The screen stays awake, and a reload doesn't lose the roast.",
  },
  {
    title: "Controls that match your machine",
    text: "SR800 heat and fan 1–9, Behmor weight, program and +30 s, Gene Cafe setpoint, Hottop heat and fan in percent, KALDI flame, and a popcorn popper mode with safety cues. Each tap is logged with its time. Temperature logging is optional.",
  },
  {
    title: "A post-roast card with the numbers that matter",
    text: "Type the weight out and see the weight loss next to total time, first crack and development. Add bean, origin, process, roast level, where you roasted and notes, and fix any event time you tapped late. Saved on your device without an account, synced when you sign in.",
  },
  {
    title: "Roast it again",
    text: "Follow any saved roast as a live reference: its yellowing, first crack and drop show as ghost markers and the clock tells you how far ahead or behind you are.",
  },
  {
    title: "My roasts and Discover",
    text: "Your roasts grouped by bean, with trends, a ready-to-taste list and CSV or JSON export. Discover shows community roasts with the same comparable numbers, filtered by machine.",
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
    title: "Roast",
    path: "/roast",
    description: "Open the roast timer and log a new batch.",
  },
  {
    title: "Discover",
    path: "/discover",
    description: "Community roasts with first crack, development and weight loss, filtered by machine and origin.",
  },
  {
    title: "Learn",
    path: "/how-to",
    description: "Roasting guides: your first roast, fixing first crack timing, defects, and each supported machine.",
  },
  {
    title: "About",
    path: "/about",
    description: "Why Roast Timer was built and who maintains it.",
  },
];

export const HOME_FAQ: { question: string; answer: string }[] = [
  {
    question: "What is Roast Timer?",
    answer:
      "A free web app for home coffee roasting. It gives you a big clock and one button for each moment of the roast (yellowing, first crack, drop), logs the changes you make on your machine, and saves each batch with its weight loss and development time so you can roast it again.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. The timer and the post-roast card work without one, and your roasts are kept on your device. Sign in with a free account when you want them synced across devices, and shared if you choose.",
  },
  {
    question: "Which roasters does it support?",
    answer:
      "Six machines have their own controls: Gene Cafe CBR-101, Behmor 2000AB Plus, FreshRoast SR800, KALDI Wide, Hottop KN-8828B-2K+ and air popcorn poppers. Each one has a guide with starting numbers.",
  },
  {
    question: "Do I need a thermometer?",
    answer:
      "No. Most home roasts are judged by time, color and sound, and that's what the app is built around. If you have a probe, you can log readings as you go, and the saved roast shows a curve once there are a few of them.",
  },
  {
    question: "What is development time, and what number should I aim for?",
    answer:
      "Development is the time from first crack to drop, and the development ratio is that time as a share of the whole roast: 1:30 after first crack in a 9:00 roast is about 17%. There is no single good number. Typical starting points differ between drum and air roasters and between light and darker roasts, so compare your own roasts and let the cup decide.",
  },
  {
    question: "Are my roasts public?",
    answer:
      "Only if you choose. New roasts are private: only you can see them. On the post-roast card or the roast's page you can make one Link only (anyone with the link can open it) or Public (listed on Discover, so people with the same machine can learn from it). Roasts kept only on your device are private too.",
  },
  {
    question: "Does it work on my phone?",
    answer:
      "Yes. It runs in any modern browser on a phone, tablet or computer. During a roast the screen is kept awake where the browser allows it, and an accidental reload brings the roast back.",
  },
];

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
