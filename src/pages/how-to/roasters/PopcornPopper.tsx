import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { RoasterFacts, RoasterLinks } from "@/components/guides/RoasterFacts";
import { Callout, H2, RefTable, Step, Steps, Ui } from "@/components/guides/prose";

const PopcornPopper = () => (
  <DocsLayout slug="popcorn-popper">
    <Callout variant="warning" title="Read the safety checklist first">
      Popcorn poppers can overheat and chaff can catch fire. Go through the{" "}
      <Link to="/how-to/popcorn-popper-safety">popcorn popper safety checklist</Link> before your first roast.
    </Callout>

    <RoasterFacts roaster="popcorn-popper" extra={[{ label: "You control", value: "Batch size and timing" }]} />

    <H2 id="how-it-works">How popper roasting works</H2>
    <p>
      A hot-air popper blows hot air up through the beans. There's usually no heat or fan control, so the roast runs at
      the speed the popper sets. Your levers are batch size, room temperature and when you stop. Roasts are fast: first
      crack often arrives around 3–5 minutes, and the whole roast is done within 4–8.
    </p>
    <p>
      Use a popper that blows air in from the <strong>side</strong> of the chamber, so the beans swirl. Models with a
      mesh floor and heating element directly underneath let chaff fall onto the element.
    </p>

    <H2 id="setup">Set up Roast Timer</H2>
    <Steps>
      <Step title="Choose the popcorn popper">
        <p>
          Open <Link to="/roast?roaster=popcorn-popper">the timer</Link> and pick <Ui>Air popcorn popper</Ui>. The first time,
          the setup shows a short safety checklist.
        </p>
      </Step>
      <Step title="Enter your batch weight">
        <p>
          Start with about 75 g; most poppers take 75–85 g. There's no standard, so the app warns you as you go above
          what a popper should take; treat 100 g as a hard ceiling.
        </p>
      </Step>
      <Step title="Note your popper model">
        <p>Different poppers roast at very different speeds, so the model is worth recording.</p>
      </Step>
    </Steps>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Charge when the beans go in">
        <p>
          Pour the beans in, switch the popper on and press <Ui>Charge — start timer</Ui> together.
        </p>
      </Step>
      <Step title="Tap yellowing">
        <p>
          Tap <Ui>Yellowing</Ui> when the beans turn pale yellow. Without a thermometer, the moments you tap are your
          record of how the roast progressed.
        </p>
      </Step>
      <Step title="Listen for first crack">
        <p>
          The app beeps at 3 minutes as a reminder to listen and check on the popper. Tap <Ui>First crack</Ui> when it
          starts.
        </p>
      </Step>
      <Step title="Pour out just before your target color">
        <p>
          Beans keep roasting from their own heat for a little while after you stop. Pour them into a metal colander a
          shade lighter than you want, tap <Ui>Drop</Ui>, and stir or shake until they're cool to the touch.
        </p>
      </Step>
    </Steps>

    <H2 id="colors">Reading the color</H2>
    <RefTable
      caption="Bean color stages in a popcorn popper"
      columns={["Color", "What's happening"]}
      rows={[
        ["Green / yellow-green", "Drying. Grassy smell."],
        ["Yellow", "Drying done. Smell turns to bread or hay."],
        ["Light brown", "Approaching or in first crack. A light roast if you stop here."],
        ["Medium brown", "Past first crack. A medium roast; 1–2 minutes after first crack is typical."],
        ["Dark brown", "Oils start to show. Close to second crack."],
        ["Very dark", "Second crack. Stop now: beyond this, risk of fire goes up fast."],
      ]}
    />

    <H2 id="problems">Common problems</H2>
    <ul>
      <li>
        <strong>Beans barely move:</strong> too many beans. If they aren't moving within 30 seconds, stop and use
        fewer.
      </li>
      <li>
        <strong>Very uneven color:</strong> normal to a degree with poppers. A slightly smaller batch, or gently shaking
        the popper, helps.
      </li>
      <li>
        <strong>Roast too fast:</strong> add a few grams (staying under 100 g), or roast somewhere cooler. A tall tin
        or chimney on top of the chamber keeps the extra beans from flying out.
      </li>
      <li>
        <strong>Roast too slow:</strong> fewer beans, or roast somewhere warmer and out of the wind.
      </li>
    </ul>

    <RoasterLinks roaster="popcorn-popper" />
  </DocsLayout>
);

export default PopcornPopper;
