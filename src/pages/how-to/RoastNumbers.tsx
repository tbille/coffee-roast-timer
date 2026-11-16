import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { H2, RefTable } from "@/components/guides/prose";

const RoastNumbers = () => (
  <DocsLayout slug="roast-numbers">
    <H2 id="moments">Moments you tap</H2>
    <p>These are the events in a roast, in the order they happen. Each one is logged with its time since charge.</p>
    <RefTable
      caption="Roast moments"
      columns={["Term", "Meaning", "In the app"]}
      rows={[
        [
          "Charge",
          "The moment the green beans meet the heat. The clock starts at 0:00.",
          "Charge — start timer, on the setup screen",
        ],
        [
          "Turning point",
          "Right after charge, a probe in the bean mass reads lower and lower as the cold beans cool it, then starts to climb. The lowest reading is the turning point. Only meaningful with a bean probe.",
          "Optional button on the Hottop and KALDI Wide, before yellowing",
        ],
        [
          "Yellowing",
          "The beans turn from green to pale yellow and smell of hay or bread. It marks the end of drying.",
          "First press of the big button",
        ],
        [
          "First crack",
          "The beans start to crackle audibly, like popcorn, as steam and gas break through. Mark it at the first run of several cracks, not a lone pop.",
          "The big button after yellowing",
        ],
        ["Second crack", "A quieter, faster crackle that marks a dark roast. Many roasts end before it.", "Smaller button after first crack"],
        [
          "Drop",
          "The end of the roast: the beans leave the heat to cool. The clock stops.",
          "The big button after first crack, and always available as a smaller button",
        ],
      ]}
    />

    <H2 id="timing">Times and phases</H2>
    <RefTable
      caption="Timing numbers"
      columns={["Term", "Meaning", "Where you see it"]}
      rows={[
        ["Total", "Charge to drop. On a Behmor this includes any time you added.", "Roast screen, post-roast card, saved roast"],
        [
          "Drying",
          "Charge to yellowing. The beans lose most of their water.",
          "Phase ribbon, when yellowing was tapped",
        ],
        [
          "Maillard",
          "Yellowing to first crack. Browning reactions build color, body and sweetness.",
          "Phase ribbon, when yellowing was tapped",
        ],
        [
          "To first crack",
          "Shown instead of drying and Maillard when yellowing wasn't marked.",
          "Phase ribbon on saved roasts",
        ],
        [
          "Development",
          "Time from first crack to drop.",
          "Status line under the clock, post-roast card, saved roast, Discover cards",
        ],
        [
          "Development ratio",
          <>
            Development time as a share of total time, often called DTR. 1:30 of development in a 9:00 roast is 17%.{" "}
            <Link to="/how-to/development-ratios">How to read it</Link>.
          </>,
          "Next to development time, everywhere it's shown",
        ],
        [
          "Pace",
          "When you roast again from a reference: how far ahead (−) or behind (+) you are at the same moment, e.g. +0:18.",
          "Status line on the roast screen",
        ],
      ]}
    />

    <H2 id="weight">Weight and roast level</H2>
    <RefTable
      caption="Weight numbers"
      columns={["Term", "Meaning", "Where you see it"]}
      rows={[
        ["Weight in", "Green coffee weight going in, in grams. Pre-filled from the batch weight.", "Setup, post-roast card"],
        ["Weight out", "Roasted coffee weight coming out, in grams.", "Post-roast card"],
        [
          "Weight loss",
          "(weight in − weight out) ÷ weight in. Most roasts land somewhere around 12–20%: lower for light roasts, higher for dark ones. The exact numbers depend on the bean and the machine.",
          "Post-roast card (live as you type), saved roast, Discover cards",
        ],
        [
          "Roast level",
          "How dark you took the roast, by eye: Light, City, City+, Full City, Full City+ or Dark. City to Full City are the usual light-to-medium range; Full City+ shows the first hints of second crack.",
          "Post-roast card, saved roast",
        ],
      ]}
    />

    <H2 id="temperature">Temperature (optional)</H2>
    <RefTable
      caption="Temperature numbers"
      columns={["Term", "Meaning", "Where you see it"]}
      rows={[
        [
          "Temperature reading",
          "Any temperature you log. What it measures depends on your roaster: air, exhaust or bean probe.",
          "Roast screen, temperature curve on the saved roast",
        ],
        ["Setpoint", "The air temperature you dial in on a Gene Cafe.", "Gene Cafe controls"],
        ["Bean temp / Env temp", "Hottop: bean probe and environment (air) temperature.", "Hottop roast screen"],
        [
          "Rate of rise (RoR)",
          "How fast bean temperature is climbing, in degrees per minute. It usually falls steadily through the roast.",
          "Read it from the slope of the curve; most useful with a bean probe",
        ],
      ]}
    />
    <p>
      Temperatures aren't comparable between different roasters, because each one measures in a different place. Compare
      times instead, or compare temperatures only between roasts on the same machine.
    </p>
  </DocsLayout>
);

export default RoastNumbers;
