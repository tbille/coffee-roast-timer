import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { Callout, H2, H3, RefTable } from "@/components/guides/prose";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does baked coffee taste like?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Baked coffee tastes flat, bready or papery with little sweetness. It happens when the roast loses momentum and stalls, usually before or around first crack.",
      },
    },
    {
      "@type": "Question",
      name: "How do I avoid scorched beans?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scorching is caused by beans sitting against a very hot surface. Lower the charge heat, keep the beans moving and avoid overloading the roaster.",
      },
    },
    {
      "@type": "Question",
      name: "What causes underdeveloped coffee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Underdeveloped coffee is usually dropped too soon after first crack. It tastes grassy, sour or peanut-like. Extend the time after first crack slightly.",
      },
    },
  ],
};

const RoastDefects = () => (
  <DocsLayout slug="roast-defects" schemas={[faqSchema]}>
    <p>
      Find the row that matches what you taste or see, check the number in Roast Timer that confirms it, and change one
      thing on your next roast.
    </p>

    <H2 id="quick-diagnosis">Quick diagnosis</H2>
    <RefTable
      caption="Roast defects: symptom, likely cause, what to check and fix"
      columns={["Defect", "You'll notice", "Check in Roast Timer", "Try next time"]}
      rows={[
        [
          "Underdeveloped",
          "Grassy, sour, peanut-like; hard, light-colored center",
          "Short development time; low development ratio",
          "Stay in the roast a little longer after first crack",
        ],
        [
          "Baked",
          "Flat, bready, papery; no sweetness, no acidity",
          "Late first crack; temperature readings barely rising before it",
          "More heat early, smaller batch, keep the roast moving",
        ],
        [
          "Scorched",
          "Dark burnt patches on the flat side of the bean; smoky, bitter",
          "Very high heat in the first minutes",
          "Lower the starting heat, don't overload, keep beans moving",
        ],
        [
          "Tipped",
          "Burnt dark spots on the ends of the bean",
          "Fast temperature rise near first crack",
          "Ease the heat off as you approach first crack",
        ],
        [
          "Uneven",
          "Mix of light and dark beans in one batch",
          "Batch weight near your roaster's maximum",
          "Smaller batch; on air roasters, more fan early",
        ],
        [
          "Too dark",
          "Ashy, bitter, oily surface; origin character gone",
          "High weight loss; long time after first crack or second crack reached",
          "Drop earlier, before your target color",
        ],
      ]}
    />
    <p>
      Weight loss is one of the clearest clues: light roasts typically lose around 11–13% of their weight, medium
      roasts around 13–15%, and dark roasts 15% or more. Enter both weights when you save and Roast Timer calculates it for you.
    </p>

    <H2 id="details">More on each defect</H2>

    <H3 id="underdeveloped">Underdeveloped</H3>
    <p>
      The beans were dropped before the inside had time to catch up with the outside. Break a bean open: a pale center is
      a giveaway. Often a 30–60 second longer finish fixes it. See{" "}
      <Link to="/how-to/development-ratios">development ratio</Link> for how to judge how long is enough.
    </p>

    <H3 id="baked">Baked</H3>
    <p>
      The roast lost momentum and the beans sat at roughly the same temperature for too long. It's hard to spot by eye;
      you'll find it in the cup. If your first crack is later than usual, start with{" "}
      <Link to="/how-to/first-crack-timing">fixing first crack timing</Link>.
    </p>

    <H3 id="scorched-tipped">Scorched and tipped</H3>
    <p>
      Both are burn marks, from different causes. <strong>Scorching</strong> is on the flat face, from contact with a
      hot drum or chamber, usually at the very start. <strong>Tipping</strong> is on the ends, where the bean is thinnest,
      usually from too much heat late in the roast.
    </p>

    <H3 id="quakers">Quakers</H3>
    <p>
      Quakers are pale beans that stay light however long you roast. They come from unripe coffee cherries, not from your
      roast. Pick them out after roasting.
    </p>

    <Callout variant="tip">
      Taste the coffee after a few days of rest before judging it. Very fresh coffee can taste sharp or muted in ways that
      look like a defect but aren't. <Link to="/how-to/cupping-notes">Record what you taste</Link> so you can compare.
    </Callout>
  </DocsLayout>
);

export default RoastDefects;
