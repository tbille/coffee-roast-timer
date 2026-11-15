import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { RoasterFacts, RoasterLinks } from "@/components/guides/RoasterFacts";
import { Callout, H2, H3, Step, Steps, Ui } from "@/components/guides/prose";

const KaldiWide = () => (
  <DocsLayout slug="kaldi-wide">
    <RoasterFacts roaster="kaldi-wide" extra={[{ label: "You control", value: "Gas flame" }]} />

    <H2 id="how-it-works">How the KALDI Wide works</H2>
    <p>
      A motorized drum turns over a gas burner. You steer the roast with the flame, and read temperature from the
      roaster's thermometer. Because your hands and eyes are on the burner, Roast Timer gives you two ways to log
      temperatures without typing: voice input and auto-record.
    </p>

    <Callout variant="warning">
      Roast outdoors or under a proper extractor, keep the area clear of anything flammable, and never leave a gas
      roaster unattended.
    </Callout>

    <H2 id="setup">Set up Roast Timer</H2>
    <Steps>
      <Step title="Choose the KALDI Wide">
        <p>
          Open <Link to="/roast?roaster=kaldi-wide">the timer</Link> and pick <Ui>KALDI Wide</Ui> from the roaster menu.
        </p>
      </Step>
      <Step title="Note the conditions">
        <p>
          In the <Ui>Environment</Ui> panel, choose indoor or outdoor and add the air temperature, humidity and wind. Gas
          roasting outdoors is very sensitive to weather, and these notes explain otherwise mysterious differences.
        </p>
      </Step>
      <Step title="Pick how you'll log temperatures">
        <p>Voice input, auto-record or typing. You can mix them during a roast.</p>
      </Step>
    </Steps>

    <H2 id="logging">Logging temperatures hands-free</H2>

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

    <H3 id="auto-record">Auto-record</H3>
    <p>
      Turn on auto-record and pick an interval: <strong>30 seconds</strong>, <strong>60 seconds</strong>,{" "}
      <strong>90 seconds</strong> or <strong>2 minutes</strong>. At each interval the app logs whatever temperature is
      in the field, so you only need to keep that number current, by voice or by typing. Every 30–60 seconds gives a
      useful curve.
    </p>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Press Start Roast when the beans go in">
        <p>Charge the drum and start the timer together.</p>
      </Step>
      <Step title="Log temperatures as you go">
        <p>
          Keep the readings coming at a steady interval. There's no flame setting to log, so jot down big flame changes
          and add them to the notes when you save. They're what you'll copy next time.
        </p>
      </Step>
      <Step title="Mark first crack, then stop">
        <p>
          Press <Ui>First Crack</Ui> or say it. When you reach your color, turn off the gas, empty the drum into your
          cooling tray and press <Ui>Stop</Ui>.
        </p>
      </Step>
    </Steps>

    <H2 id="tips">Tips</H2>
    <ul>
      <li>
        <strong>Cool fast.</strong> The KALDI has no built-in cooler. A sieve and a fan get beans cool in a few minutes.
      </li>
      <li>
        <strong>Compare by weather.</strong> A 20 °C day and a 5 °C day need different flames. The environment notes let
        you find a roast from similar conditions.
      </li>
    </ul>

    <RoasterLinks roaster="kaldi-wide" />
  </DocsLayout>
);

export default KaldiWide;
