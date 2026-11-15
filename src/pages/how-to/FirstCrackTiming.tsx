import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { Callout, H2, RefTable, Ui } from "@/components/guides/prose";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "When should first crack happen in a home roast?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on the roaster. Air poppers often reach first crack in 3 to 5 minutes, a FreshRoast SR800 in about 5 to 7, and home drum roasters such as the Gene Cafe, Hottop or KALDI in about 8 to 12. Consistency from batch to batch matters more than hitting a specific number.",
      },
    },
    {
      "@type": "Question",
      name: "What if first crack is very early?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Early first crack usually means too much heat early on or a batch that is too small for the machine. Lower the early heat or add a little more coffee.",
      },
    },
    {
      "@type": "Question",
      name: "What if first crack is very late?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Late first crack usually means too little energy or too big a batch. Add heat earlier, reduce the batch size or preheat more consistently.",
      },
    },
  ],
};

const FirstCrackTiming = () => (
  <DocsLayout slug="first-crack-timing" schemas={[faqSchema]}>
    <p>
      Use this guide when first crack keeps landing at a different time, or at a time that gives you sour or flat coffee.
      You'll need at least one saved roast with first crack marked.
    </p>

    <H2 id="mark-it">Mark first crack the same way every time</H2>
    <p>
      Your timings are only comparable if you mark them consistently. Press <Ui>First Crack</Ui> when you hear the
      first run of several cracks close together, not at the first lone pop. Write down which rule you use in the roast
      notes and stick to it.
    </p>

    <H2 id="find-your-window">Find your normal window</H2>
    <p>
      These are typical starting points. After a few roasts, your own past profiles are a better guide than this table.
    </p>
    <RefTable
      caption="Typical first crack times by roaster type"
      columns={["Roaster type", "Typical first crack"]}
      rows={[
        ["Air popcorn popper", "3–5 min"],
        ["FreshRoast SR800", "5–7 min"],
        ["Gene Cafe, Hottop, KALDI Wide", "8–12 min"],
        ["Behmor 2000AB Plus", "11–15 min"],
      ]}
    />
    <p>
      Bean density, batch size and room temperature all shift this. Dense, high-grown coffees tend to crack a little
      later; a cold garage can add a minute or more.
    </p>

    <H2 id="too-early">If first crack comes too early</H2>
    <p>
      An early crack usually means the beans got too much heat before they were dry through. The cup tends to be sharp
      and thin, sometimes with scorched or tipped beans.
    </p>
    <ol>
      <li>Lower the heat for the first few minutes.</li>
      <li>
        On an air roaster (popper, FreshRoast), raise the fan a step: more air means less heat reaching the beans.
      </li>
      <li>If your machine allows it, add a little more coffee. A bigger batch takes longer to heat up.</li>
    </ol>

    <H2 id="too-late">If first crack comes too late</H2>
    <p>
      A late crack usually means the roast ran out of energy. The cup tends to taste flat, bready or papery: the classic{" "}
      <Link to="/how-to/roast-defects">baked</Link> defect.
    </p>
    <ol>
      <li>Add more heat earlier, rather than trying to catch up near first crack.</li>
      <li>Reduce the batch size.</li>
      <li>Preheat the same way every time, and allow extra time between back-to-back roasts.</li>
      <li>On an air roaster, lower the fan a step so the beans hold more heat.</li>
    </ol>

    <Callout variant="tip">
      Change one thing per roast. If you change heat and batch size together, you won't know which one fixed it.
    </Callout>

    <H2 id="check">Check the result</H2>
    <p>
      Open your new roast and the previous one and compare the <Ui>First crack</Ui> time in each summary. Then check the{" "}
      <Link to="/how-to/development-ratios">development ratio</Link>: once first crack is steady, how long you roast after
      it is the next thing to tune.
    </p>
  </DocsLayout>
);

export default FirstCrackTiming;
