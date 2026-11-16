import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { Callout, H2 } from "@/components/guides/prose";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why is first crack late on my Behmor 2000AB?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Late first crack on a Behmor is usually caused by too large a batch, a cold room or roaster, or low line voltage. Try a smaller batch, a hotter program such as P1, and starting from the same roaster temperature each time.",
      },
    },
    {
      "@type": "Question",
      name: "What does Err 7 mean on a Behmor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Err 7 means Start was not pressed within about 30 seconds of the safety prompt at 75% of the roast time, so the roaster stopped heating. Stay with the roaster and press Start when it beeps.",
      },
    },
    {
      "@type": "Question",
      name: "How should I use extensions on a Behmor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Press + to add time earlier in the roast to keep momentum, rather than stacking extensions at the very end. Log each press with +30 s in Roast Timer, as many taps as matches what your machine added.",
      },
    },
  ],
};

const BehmorTroubleshooting = () => (
  <DocsLayout slug="behmor-2000ab-troubleshooting" schemas={[faqSchema]}>
    <p>
      Change one thing per roast, and compare the new roast's first crack time with the last one. New to the Behmor?
      Start with <Link to="/how-to/roasters/behmor-2000ab">Roasting on the Behmor 2000AB Plus</Link>.
    </p>

    <H2 id="late-first-crack">First crack is late, or never comes</H2>
    <p>The roaster isn't getting enough energy into the beans.</p>
    <ol>
      <li>Reduce the batch size. Try around 340 g instead of a full pound.</li>
      <li>Use a hotter program. P3 to P5 apply less heat and often need time added; P1 applies the most. Running by hand, stay on P5 (100%) longer early on.</li>
      <li>Roast somewhere warmer. A cold garage or a breeze can add minutes.</li>
      <li>
        Avoid extension cords and shared circuits. The Behmor is sensitive to low voltage, and it shows up as slow
        roasts.
      </li>
    </ol>

    <H2 id="stall">The roast stalls after adding time</H2>
    <p>
      If you add all your time in the last minute, the roast often loses momentum and tastes flat. Add extensions in the
      middle of the roast instead, and log each one with <strong>+30 s</strong> so you can see when you added it on
      the saved roast.
    </p>

    <H2 id="err-7">The roaster stopped and shows Err 7</H2>
    <p>
      You missed the 75% prompt. About three quarters through the set time, the Behmor beeps and flashes; you have about
      30 seconds to press <strong>Start</strong>. The roast is over at that point. Tap <strong>Drop</strong>, let the
      beans cool, weigh them and save the roast with a note so you don't compare it with complete roasts.
    </p>

    <H2 id="uneven">Color is uneven</H2>
    <ol>
      <li>Reduce the batch size so beans can tumble freely.</li>
      <li>Clean the chaff tray and drum. Built-up chaff blocks heat and is a fire risk.</li>
      <li>Check that the drum is seated properly and turning.</li>
    </ol>

    <Callout variant="warning" title="If you see flames">
      Press <strong>Cool</strong> and keep the door closed. Opening it feeds the fire with air. Unplug the roaster if
      it's safe to reach the plug, and let it burn out inside.
    </Callout>
  </DocsLayout>
);

export default BehmorTroubleshooting;
