import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { RoasterFacts, RoasterLinks } from "@/components/guides/RoasterFacts";
import { Callout, H2, Step, Steps, Ui } from "@/components/guides/prose";

const Behmor2000AB = () => (
  <DocsLayout slug="behmor-2000ab">
    <RoasterFacts
      roaster="behmor-2000ab"
      extra={[{ label: "You control", value: "Profile and added time" }]}
    />

    <H2 id="how-it-works">How the Behmor works</H2>
    <p>
      You choose a batch weight, which sets the roast time, and a profile (P1 to P5), which sets how heat is applied
      over that time. The roaster then counts down. Your main lever during the roast is adding time: press{" "}
      <strong>+</strong> on the roaster to extend it.
    </p>
    <p>There's no temperature readout, so you roast by time, sight and sound. That's exactly what Roast Timer records.</p>

    <Callout variant="warning" title="Press Start at the 75% prompt">
      About three quarters of the way through, the Behmor beeps and flashes. You have to press <strong>Start</strong>{" "}
      again within a few seconds, or it stops heating, goes into cooling and shows <strong>Err 7</strong>. It's a
      safety feature to make sure someone is watching. Stay with the roaster.
    </Callout>

    <H2 id="setup">Set up Roast Timer</H2>
    <Steps>
      <Step title="Choose the Behmor">
        <p>
          Open <Link to="/roast?roaster=behmor-2000ab">the timer</Link> and pick <Ui>Behmor 2000AB</Ui> from the roaster
          menu.
        </p>
      </Step>
      <Step title="Match the profile and batch size">
        <p>
          Pick the same profile in the app as on the roaster, and enter your batch weight. The app's countdown starts
          from a typical time for that profile; your Behmor's display is the one to trust if they differ.
        </p>
      </Step>
    </Steps>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Press Start Roast when you press Start on the Behmor">
        <p>The app counts down alongside the machine.</p>
      </Step>
      <Step title="Log every extension">
        <p>
          Each time you press <strong>+</strong> on the roaster, press <Ui>Add 30 Seconds</Ui> in the app (up to six
          times). The app records when you added it, which is what you'll need to repeat the roast.
        </p>
      </Step>
      <Step title="Watch and listen through the door">
        <p>Look for yellowing, then browning, and listen for first crack. Press <Ui>First Crack</Ui> when it starts.</p>
      </Step>
      <Step title="Stop when you press Cool">
        <p>
          When the beans reach your color, press <strong>Cool</strong> on the Behmor and <Ui>Stop</Ui> in the app. The
          Behmor cools the beans in the drum.
        </p>
      </Step>
    </Steps>

    <H2 id="tips">Tips for repeatable Behmor roasts</H2>
    <ul>
      <li>
        <strong>Add time early, not at the end.</strong> An extension in the middle of the roast keeps momentum. Stacking
        them right before the end often leads to a stall and baked flavors.
      </li>
      <li>
        <strong>Start from the same state.</strong> Let the roaster cool fully between batches, or always roast
        back-to-back. Mixing the two moves first crack by minutes.
      </li>
      <li>
        <strong>Smaller batches are easier.</strong> A full pound pushes the Behmor to its limit. Around 340 g (12 oz)
        gives more room to steer.
      </li>
      <li>
        <strong>Aim for about 2–3 minutes after first crack</strong> for a medium roast, then adjust by taste.
      </li>
    </ul>

    <p>
      First crack late, roast stalling or getting Err 7? See{" "}
      <Link to="/how-to/behmor-2000ab-troubleshooting">Troubleshoot a Behmor roast</Link>.
    </p>

    <RoasterLinks roaster="behmor-2000ab" />
  </DocsLayout>
);

export default Behmor2000AB;
