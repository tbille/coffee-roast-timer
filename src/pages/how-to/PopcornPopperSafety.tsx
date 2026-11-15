import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { Callout, H2 } from "@/components/guides/prose";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much coffee can I roast in a popcorn popper?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Start around 75 grams. Most poppers handle 50 to 80 grams well, and 100 grams should be treated as a hard ceiling.",
      },
    },
    {
      "@type": "Question",
      name: "Is roasting coffee in a popcorn popper safe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It can be done more safely with good ventilation, constant supervision and small batches, but it still carries heat, smoke and fire risk, and may void the popper's warranty.",
      },
    },
  ],
};

const PopcornPopperSafety = () => (
  <DocsLayout slug="popcorn-popper-safety" schemas={[faqSchema]}>
    <p>
      Once you've done this a few times it becomes habit. For how to actually run the roast, see{" "}
      <Link to="/how-to/roasters/popcorn-popper">Roasting in an air popcorn popper</Link>.
    </p>

    <H2 id="before">Before you switch it on</H2>
    <ul>
      <li>
        <strong>Use a side-vented popper.</strong> Air should enter from the side of the chamber so the beans swirl. Avoid
        models with a mesh floor directly over the heating element.
      </li>
      <li>
        <strong>Weigh the beans.</strong> 75 g is a good start. Never go above 100 g.
      </li>
      <li>
        <strong>Ventilate.</strong> Roast outside or right under a strong extractor fan. Roasting makes a lot of smoke,
        especially past first crack.
      </li>
      <li>
        <strong>Clear the area.</strong> Nothing flammable nearby, on a stable heat-safe surface.
      </li>
      <li>
        <strong>Have a fire extinguisher</strong> or fire blanket within reach.
      </li>
      <li>
        <strong>Get your cooling ready:</strong> a metal colander and an oven glove.
      </li>
    </ul>

    <H2 id="during">During the roast</H2>
    <ul>
      <li>
        <strong>Stay with it the whole time.</strong> Things change in seconds.
      </li>
      <li>
        <strong>Stop before second crack goes on for long.</strong> Very dark beans and loose chaff are what catch fire.
      </li>
      <li>
        <strong>Don't touch the chamber.</strong> It gets hot enough to burn.
      </li>
    </ul>

    <H2 id="after">After the roast</H2>
    <ul>
      <li>
        <strong>Let the popper cool for at least 10 minutes</strong> before the next batch. Back-to-back roasts overheat
        the motor and the thermal cutoff.
      </li>
      <li>
        <strong>Empty the chaff</strong> from the chamber and around the popper.
      </li>
    </ul>

    <Callout variant="warning" title="If something catches fire">
      Switch off and unplug the popper if you can do it safely. Don't pour water on it: it's electrical. Use the fire
      extinguisher or blanket, or let it burn out if it's outdoors and contained.
    </Callout>

    <p>
      Poppers also tend to break when used for coffee, and doing so usually voids the warranty. When you're ready for
      more control, a dedicated air roaster like the{" "}
      <Link to="/how-to/roasters/freshroast-sr800">FreshRoast SR800</Link> works the same way with adjustable heat and
      fan.
    </p>
  </DocsLayout>
);

export default PopcornPopperSafety;
