import { Link } from "react-router-dom";
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
        text: "Development ratio (also called development time ratio or DTR) is the share of the total roast time that happens after first crack begins. For example, 2:30 of development in a 10:00 roast is 25%.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good development ratio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Many roasters aim for roughly 20 to 25% for medium roasts, and the 15 to 25% band covers most light-to-medium roasts. Treat it as a way to compare your own roasts, not as a target that guarantees good coffee.",
      },
    },
  ],
};

const DevelopmentRatios = () => (
  <DocsLayout slug="development-ratios" schemas={[faqSchema]}>
    <H2 id="definition">The short version</H2>
    <p>
      First crack is the point where the beans start to crackle as moisture and gas escape. Everything after it is called{" "}
      <strong>development</strong>. Development ratio is how much of the whole roast that last part takes up.
    </p>
    <Formula caption="Example: first crack at 7:30, drop at 10:00. Development time is 2:30, so 2:30 ÷ 10:00 = 25%.">
      development ratio = development time ÷ total roast time × 100
    </Formula>
    <p>
      Roast Timer works this out as soon as you press <strong>First Crack</strong>. You'll see it live under the timer,
      in each roast's summary, on Discover cards and in comparisons.
    </p>

    <H2 id="why-it-matters">Why it's useful</H2>
    <p>
      Two roasts of different lengths aren't easy to compare by minutes alone. A ratio makes them comparable: 2:30 of
      development in a 10-minute air roast and 3:45 in a 15-minute drum roast are both 25%.
    </p>
    <p>
      During development, sugars caramelize and acids break down. Too little time and the coffee can taste grassy or
      sour. Too much and it can turn flat, bitter or ashy, and the character of the origin fades.
    </p>

    <H2 id="ranges">What the numbers usually mean</H2>
    <p>
      Roast Timer shows the ratio in green between 15% and 25%, orange below and red above. Those bands are a rough
      guide:
    </p>
    <RefTable
      caption="Development ratio ranges"
      columns={["Ratio", "Often tastes", "Notes"]}
      rows={[
        ["Under 15%", "Grassy, sour, thin", "Usually underdeveloped, unless the roast is very fast and light on purpose"],
        ["15–20%", "Bright, delicate, lively acidity", "Common for light roasts meant for filter"],
        ["20–25%", "Balanced, sweet", "A common target for medium roasts"],
        ["Over 25%", "Heavier, roastier, less acidity", "Fine for darker styles, but watch for flat or ashy flavors"],
      ]}
    />

    <H2 id="limits">Where it stops being useful</H2>
    <p>Development ratio is one indicator among many. It doesn't tell you:</p>
    <ul>
      <li>
        <strong>How dark the roast is.</strong> A short, hot roast and a long, gentle one can share a ratio and taste very
        different. Weight loss and color tell you more about roast level.
      </li>
      <li>
        <strong>Whether the roast stalled.</strong> If the roast stalls before first crack, the ratio can look fine
        while the coffee tastes{" "}
        <Link to="/how-to/roast-defects">baked</Link>. The ratio can't see what happened before first crack.
      </li>
      <li>
        <strong>Anything without a well-marked first crack.</strong> If you press First Crack late one day and early the
        next, the ratio moves without the roast changing. See{" "}
        <Link to="/how-to/first-crack-timing">marking first crack consistently</Link>.
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
