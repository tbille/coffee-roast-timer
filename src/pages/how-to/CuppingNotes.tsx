import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { Callout, H2, RefTable, Step, Steps, Ui } from "@/components/guides/prose";

const CuppingNotes = () => (
  <DocsLayout slug="cupping-notes">
    <p>
      Tasting notes turn a list of roasts into something you can learn from. You'll need a saved roast of your own and
      some of that coffee, rested and ready to brew.
    </p>

    <H2 id="when-to-taste">When to taste</H2>
    <p>
      Freshly roasted coffee is still releasing gas, which can make it taste sharp or muted. For everyday brewing, wait
      before judging:
    </p>
    <ul>
      <li>
        <strong>Light roasts:</strong> 5–7 days
      </li>
      <li>
        <strong>Medium roasts:</strong> 3–5 days
      </li>
      <li>
        <strong>Dark roasts:</strong> 2–3 days
      </li>
    </ul>
    <p>
      Formal cupping, the way roasters check a batch, is usually done sooner, 8–24 hours after roasting. Either works as
      long as you rest each roast for the same time before comparing them.
    </p>

    <H2 id="add-notes">Add notes to a roast</H2>
    <Steps>
      <Step title="Open the roast">
        <p>
          Go to <Link to="/roasts">My roasts</Link> and open the roast you're tasting.
        </p>
      </Step>
      <Step title="Press Add cupping">
        <p>
          It's in the <Ui>Tasting notes</Ui> section near the top of the page. You only see it on your own roasts. If the
          roast already has notes, the button reads <Ui>Edit cupping</Ui>.
        </p>
      </Step>
      <Step title="Fill in what you can">
        <p>Every field is optional, so a score and two tags are fine. See the table below for what each field is for.</p>
      </Step>
      <Step title="Press Save Notes">
        <p>Your notes show on the roast straight away. You can edit them at any time.</p>
      </Step>
    </Steps>

    <RefTable
      caption="Fields in the cupping form"
      columns={["Field", "What to enter"]}
      rows={[
        ["Cupping Date", "The day you tasted it."],
        ["Rest Days", "Days between roasting and tasting. This is what makes notes comparable."],
        ["Cupping Score", "0–100. 50 is average; use the full range so differences stand out."],
        ["Brew Method", "Espresso, pour over, French press, AeroPress and more. Keep it the same when comparing."],
        ["Flavor Profile", "Up to 8 tags from a fixed list, such as Chocolate, Citrus, Floral, Nutty or Wine-like."],
        ["Tasting Notes", "Free text for everything else, in your own words."],
        ["Roasted Bean Photo", "A photo of the roasted beans, useful for comparing color between batches."],
      ]}
    />

    <H2 id="what-to-write">What to write</H2>
    <p>Work through the cup in this order. You don't need fancy words, just be specific.</p>
    <ul>
      <li>
        <strong>Aroma:</strong> what you smell before drinking.
      </li>
      <li>
        <strong>Flavor:</strong> the main tastes. “Blueberry and lemon” is more useful than “fruity”.
      </li>
      <li>
        <strong>Acidity:</strong> bright like lemon, soft like apple, or flat.
      </li>
      <li>
        <strong>Body:</strong> thin and tea-like, medium, or heavy and syrupy.
      </li>
      <li>
        <strong>Finish:</strong> what stays after you swallow: clean, sweet, bitter, drying.
      </li>
      <li>
        <strong>Problems:</strong> anything grassy, sour, papery, smoky or ashy. These point to a roast defect.
      </li>
    </ul>

    <H2 id="use-them">Turn notes into your next roast</H2>
    <p>
      Off-flavors usually trace back to something you can see in the roast's numbers. The{" "}
      <Link to="/how-to/roast-defects">defect guide</Link> has the full table; the most common are:
    </p>
    <ul>
      <li>
        <strong>Grassy or sour:</strong> probably underdeveloped. Stay in a little longer after first crack.
      </li>
      <li>
        <strong>Flat or papery:</strong> probably baked. Check whether first crack came late.
      </li>
      <li>
        <strong>Ashy or bitter:</strong> probably too dark. Drop earlier.
      </li>
    </ul>

    <Callout variant="tip">
      Brew every roast you compare the same way: same method, dose, grind and water. Otherwise you're comparing brewing,
      not roasting.
    </Callout>
  </DocsLayout>
);

export default CuppingNotes;
