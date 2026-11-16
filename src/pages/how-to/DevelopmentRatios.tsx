import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { Callout, Formula, H2, RefTable } from "@/components/guides/prose";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is development ratio in coffee roasting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Development ratio (also called development time ratio or DTR) is the share of the total roast time that happens after first crack begins. For example, 2:00 of development in a 10:00 roast is 20%.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good development ratio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There is no single good number. Typical starting points differ by machine and roast style: drum roasters often land somewhere around 15 to 25% for light to medium roasts, fast air roasters often lower, and darker roasts higher. Use it to compare your own roasts of the same coffee on the same machine, and let the cup decide.",
      },
    },
  ],
};

const DevelopmentRatios = () => (
  <DocsLayout slug="development-ratios" schemas={[faqSchema]}>
    <H2 id="definition">The short version</H2>
    <p>
      First crack is the point where the beans start to crackle as steam and gas escape. Everything after it, until you
      drop the beans, is called <strong>development</strong>. Development ratio is how much of the whole roast that last
      part takes up. You'll also see it called development time ratio, or DTR.
    </p>
    <Formula caption="Example: first crack at 8:00, drop at 10:00. Development time is 2:00, so 2:00 ÷ 10:00 = 20%.">
      development ratio = development time ÷ total roast time × 100
    </Formula>
    <p>
      Roast Timer works this out from the moments you tap. After <strong>First crack</strong>, the status line under the
      clock shows development time and its share of the roast, live and without a verdict. It's also on the post-roast
      card, each saved roast and Discover cards.
    </p>

    <H2 id="why-it-matters">Why it's useful</H2>
    <p>
      Two roasts of different lengths aren't easy to compare by minutes alone. A ratio helps: 1:40 of development in a
      10-minute roast and 2:30 in a 15-minute roast are both about 17%.
    </p>
    <p>
      During development, sugars caramelize and acids break down. Too little and the coffee can taste grassy, sour or
      thin. Too much and it can turn flat, bitter or ashy, and the character of the origin fades. Roasting writers such
      as Scott Rao and Rob Hoos popularized tracking it as a way to keep roasts consistent, and both treat it as one
      indicator among several, not a recipe.
    </p>

    <H2 id="ranges">Typical starting points</H2>
    <p>
      There is no single “good” development ratio. What's typical depends on the kind of roaster and how dark you're
      going. These are rough places to start, not targets:
    </p>
    <RefTable
      caption="Typical development ratio starting points by roaster type and roast style"
      columns={["Roaster and style", "Typical starting point", "Notes"]}
      rows={[
        [
          "Drum (Gene Cafe, Behmor, Hottop, KALDI), light roast",
          "Around 15–20%",
          "Longer roasts spread the same development over more total time, so the ratio reads lower",
        ],
        [
          "Drum, medium roast",
          "Around 20–25%",
          "Where many drum roasters start for an all-round coffee",
        ],
        [
          "Air or fluid-bed (FreshRoast, popcorn popper), light to medium",
          "Often lower, roughly 10–20%",
          "Short, fast roasts with a quick first crack; judge by color and taste more than the ratio",
        ],
        [
          "Any machine, darker roast",
          "Higher, often 25% and up",
          "Expected for darker styles; watch for flat, roasty or ashy flavors",
        ],
      ]}
    />
    <p>
      Once you have a few roasts of a coffee you like, your own numbers are a better guide than this table. That's why
      Roast Timer shows the ratio as a plain number and never colors it as good or bad.
    </p>

    <H2 id="limits">Where it stops being useful</H2>
    <p>Development ratio doesn't tell you:</p>
    <ul>
      <li>
        <strong>How dark the roast is.</strong> A short, hot roast and a long, gentle one can share a ratio and taste very
        different. Weight loss and color tell you more about roast level.
      </li>
      <li>
        <strong>Whether the roast stalled.</strong> If the roast stalls before first crack, the ratio can look fine
        while the coffee tastes <Link to="/how-to/roast-defects">baked</Link>. The ratio can't see what happened before
        first crack.
      </li>
      <li>
        <strong>Anything without a well-marked first crack.</strong> If you tap First crack late one day and early the
        next, the ratio moves without the roast changing. See{" "}
        <Link to="/how-to/first-crack-timing">marking first crack consistently</Link>. Tapped it late? Fix the time on
        the post-roast card.
      </li>
    </ul>

    <Callout>
      Use the ratio to compare your own roasts of the same coffee on the same machine. That's where it's most reliable.
    </Callout>

    <H2 id="change-it">How to change it</H2>
    <p>
      To <strong>raise</strong> the ratio, ease off the heat slightly as first crack starts so the beans spend longer
      developing, or drop a little later. To <strong>lower</strong> it, keep more energy going into first crack or drop
      earlier. Change it in small steps: 15–30 seconds of development is a noticeable difference in the cup.
    </p>
  </DocsLayout>
);

export default DevelopmentRatios;
