import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { RoasterFacts, RoasterLinks } from "@/components/guides/RoasterFacts";
import { Callout, H2, Step, Steps, Ui } from "@/components/guides/prose";

const Behmor2000AB = () => (
  <DocsLayout slug="behmor-2000ab">
    <RoasterFacts
      roaster="behmor-2000ab"
      extra={[{ label: "You control", value: "Weight, program and added time" }]}
    />

    <H2 id="how-it-works">How the Behmor works</H2>
    <p>The front panel gives you three main levers:</p>
    <ul>
      <li>
        <strong>Weight button</strong> (¼ lb, ½ lb, 1 lb). It sets the starting roast time shown on the LCD. Pick the one
        closest to your batch.
      </li>
      <li>
        <strong>Program</strong> (P1 to P5). In automatic mode each program applies heat differently over that time; P1
        is the one with the most heat.
      </li>
      <li>
        <strong>+ and −</strong> change the time left on the LCD. Pressing + during the roast is how you extend it.
      </li>
    </ul>
    <p>
      The 2000AB Plus also has a <strong>manual mode</strong>. There, P1 to P5 become heat power levels from 0% to 100% in
      25% steps that you change as you go, and D changes the drum speed. Check your manual for how to enter it on your
      unit's firmware.
    </p>
    <p>There's no temperature readout, so you roast by time, sight and sound. That's exactly what Roast Timer records.</p>

    <Callout variant="warning" title="Press Start at the 75% prompt">
      About three quarters of the way through the set time, the Behmor beeps and flashes. You have about 30 seconds to
      press <strong>Start</strong> again, or it stops heating and shows <strong>Err 7</strong>. It's a safety feature
      to make sure someone is watching. Stay with the roaster, and keep the chaff tray clean: built-up chaff is what
      catches fire.
    </Callout>

    <H2 id="setup">Set up Roast Timer</H2>
    <Steps>
      <Step title="Choose the Behmor">
        <p>
          Open <Link to="/roast?roaster=behmor-2000ab">the timer</Link> and pick <Ui>Behmor 2000AB Plus</Ui>.
        </p>
      </Step>
      <Step title="Match the weight button, program and time">
        <p>
          Enter your batch weight, then pick the same weight button and program you pressed on the roaster. The app
          fills in a starting time from the weight button; change it to what your LCD actually shows, because that's
          the number to trust.
        </p>
      </Step>
    </Steps>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Charge when you press Start on the Behmor">
        <p>
          Press <Ui>Charge — start timer</Ui> at the same moment. The roast screen counts up like every other machine,
          and shows the LCD's remaining time as secondary information so you can glance at both.
        </p>
      </Step>
      <Step title="Log every extension">
        <p>
          Each time you press + on the roaster, tap <Ui>+30 s</Ui> in the app. It's logged with the time you added it,
          which is what you'll need to repeat the roast.
        </p>
      </Step>
      <Step title="In manual mode, log the power changes">
        <p>
          When you switch to a different P power level, tap the same program on screen. Each change is logged with its
          time.
        </p>
      </Step>
      <Step title="Watch and listen through the door">
        <p>
          Tap <Ui>Yellowing</Ui> when the beans turn pale yellow, then <Ui>First crack</Ui> when the cracking starts.
          The Behmor manual itself says to judge it by sound, not by the clock.
        </p>
      </Step>
      <Step title="Drop when you press Cool">
        <p>
          When the beans reach your color, press <strong>Cool</strong> on the Behmor and <Ui>Drop</Ui> in the app. The
          Behmor cools the beans in the drum, so they keep roasting a little at first: drop a shade early.
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
        <strong>Start around 2–3 minutes after first crack</strong> for a medium roast, then adjust by taste. The
        in-drum cooling adds a little more.
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
