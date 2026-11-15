import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { H2, RefTable } from "@/components/guides/prose";

const RoastNumbers = () => (
  <DocsLayout slug="roast-numbers">
    <H2 id="timing">Timing</H2>
    <RefTable
      caption="Timing numbers"
      columns={["Term", "Meaning", "Where you see it"]}
      rows={[
        ["Total time", "From Start Roast to Stop. On a Behmor this includes any added time.", "Timer, profile summary"],
        [
          "First crack",
          "When you pressed First Crack: the beans start to crackle audibly as they expand.",
          "Profile summary, roast steps",
        ],
        ["Second crack", "A quieter, faster crackle that marks a dark roast.", "Roast steps"],
        ["Development time", "Time from first crack to the end of the roast.", "Live under the timer, profile summary"],
        [
          "Development ratio",
          <>
            Development time as a share of total time.{" "}
            <Link to="/how-to/development-ratios">How to read it</Link>.
          </>,
          "Live under the timer, profile summary, Discover cards, comparisons",
        ],
        [
          "Phases",
          "Drying (green to yellow) and Maillard (yellow to first crack) when you logged yellowing, otherwise one \"To first crack\" phase; then Development.",
          "Phase bar on the profile summary",
        ],
      ]}
    />

    <H2 id="weight">Weight</H2>
    <RefTable
      caption="Weight numbers"
      columns={["Term", "Meaning", "Where you see it"]}
      rows={[
        ["Batch / Initial weight", "Green coffee weight going in, in grams.", "Save form, profile summary"],
        ["Final weight", "Roasted coffee weight coming out, in grams.", "Save form"],
        [
          "Weight loss",
          "(initial − final) ÷ initial. Roughly 11–13% for light roasts, 13–15% medium, 15%+ dark.",
          "Profile summary, comparisons",
        ],
      ]}
    />

    <H2 id="temperature">Temperature</H2>
    <RefTable
      caption="Temperature numbers"
      columns={["Term", "Meaning", "Where you see it"]}
      rows={[
        [
          "Temperature reading",
          "Any temperature you record. What it measures depends on your roaster: air, exhaust or bean probe.",
          "Temperature curve, roast steps",
        ],
        ["Bean temp / Env temp", "Hottop only: bean probe and environment (air) temperature.", "Hottop timer screen"],
        [
          "Rate of rise (RoR)",
          "How fast bean temperature is climbing, in °C per minute. It should slowly fall through the roast.",
          "Hottop timer screen",
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
