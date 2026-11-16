import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { RoasterFacts, RoasterLinks } from "@/components/guides/RoasterFacts";
import { Callout, H2, H3, Step, Steps, Ui } from "@/components/guides/prose";

const KaldiWide = () => (
  <DocsLayout slug="kaldi-wide">
    <RoasterFacts roaster="kaldi-wide" extra={[{ label: "You control", value: "Gas flame" }]} />

    <H2 id="how-it-works">How the KALDI Wide works</H2>
    <p>
      A motorized drum turns over a gas burner. You steer the roast with the flame, and read temperature from the
      roaster's thermometer. Because your hands and eyes are on the burner, Roast Timer lets you log temperatures by
      voice as well as by typing.
    </p>

    <Callout variant="warning">
      Roast outdoors or under a proper extractor, keep the area clear of anything flammable, keep a fire extinguisher
      nearby, and never leave a gas roaster unattended.
    </Callout>

    <H2 id="setup">Set up Roast Timer</H2>
    <Steps>
      <Step title="Choose the KALDI Wide">
        <p>
          Open <Link to="/roast?roaster=kaldi-wide">the timer</Link> and pick <Ui>KALDI Wide</Ui>.
        </p>
      </Step>
      <Step title="Set the starting flame">
        <p>Set <Ui>Flame</Ui> to your burner setting, on whatever scale you use for your burner.</p>
      </Step>
    </Steps>

    <H2 id="logging">Logging temperatures hands-free (optional)</H2>

    <H3 id="voice">Voice input</H3>
    <p>
      Turn on the microphone and say the full temperature, like “one hundred ninety two”. Say it in full: shortcuts like
      “one ninety two” aren't understood. Readings from 1 to 300 °C are accepted. You can also say <strong>“first crack”</strong> or <strong>“second crack”</strong> to mark those
      events.
    </p>
    <p>
      Voice input uses your browser's speech recognition, so it needs microphone permission. Chrome, Edge and Safari
      support it; in other browsers the app tells you it's unavailable and you can type instead.
    </p>

    <H3 id="typing">Typing</H3>
    <p>
      Type the reading and press Enter. Every 30–60 seconds gives a useful curve. Temperature is always optional: the
      moments you tap are enough for the summary.
    </p>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Charge when the beans go in">
        <p>
          Charge the drum and press <Ui>Charge — start timer</Ui> together. Tap <Ui>Turning point</Ui> at the lowest
          probe reading if you want it on record.
        </p>
      </Step>
      <Step title="Log temperatures as you go">
        <p>
          Each time you change the flame, change <Ui>Flame</Ui> on screen: it's logged with its time, and it's what
          you'll copy next time. Add temperature readings if you're taking them.
        </p>
      </Step>
      <Step title="Tap yellowing and first crack, then drop">
        <p>
          Tap <Ui>Yellowing</Ui> and <Ui>First crack</Ui> as they happen. When you reach your color, turn off the gas,
          empty the drum into your cooling tray and tap <Ui>Drop</Ui>.
        </p>
      </Step>
    </Steps>

    <H2 id="tips">Tips</H2>
    <ul>
      <li>
        <strong>Cool fast.</strong> The KALDI has no built-in cooler. A sieve and a fan get beans cool in a few minutes.
      </li>
      <li>
        <strong>Compare by weather.</strong> A 20 °C day and a 5 °C day need different flames. Note where you roasted
        and the air temperature on the post-roast card so you can find a roast from similar conditions.
      </li>
    </ul>

    <RoasterLinks roaster="kaldi-wide" />
  </DocsLayout>
);

export default KaldiWide;
