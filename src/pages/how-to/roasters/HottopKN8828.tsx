import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { RoasterFacts, RoasterLinks } from "@/components/guides/RoasterFacts";
import { Callout, H2, RefTable, Step, Steps, Ui } from "@/components/guides/prose";

const HottopKN8828 = () => (
  <DocsLayout slug="hottop-kn-8828">
    <RoasterFacts roaster="hottop-kn8828" extra={[{ label: "You control", value: "Heat % and fan %" }]} />

    <H2 id="how-it-works">How the Hottop works</H2>
    <p>
      The Hottop KN-8828B-2K+ is an electric drum roaster with two thermocouples: the display shows bean temperature
      (BT) and environment temperature (ET) throughout the roast. It has two modes: <strong>Auto</strong>, which runs
      its one built-in program and adjusts heat and fan for you, and <strong>Manual</strong>, where you set heat and fan
      yourself. Because it reads bean temperature, it's the roaster where logging temperatures pays
      off most: your readings become a curve, and its slope is the <strong>rate of rise</strong> (RoR), how many
      degrees per minute the beans are gaining.
    </p>

    <ul>
      <li>
        <strong>Heat</strong> is the power to the element, 0–100% in 1% steps on the panel. The app logs it in 10% steps,
        so round to the nearest 10.
      </li>
      <li>
        <strong>Fan</strong> moves in 10% steps and the panel shows it as 0 to 10. Fan 6 on the panel is 60% in the app.
      </li>
      <li>
        <strong>Target time and target temperature</strong> end the roast in both modes: the Hottop ejects the beans
        when either is reached. Auto starts at 18:00 and 402 °F; the most it allows is 25:00 and 412 °F.
      </li>
    </ul>

    <Callout variant="warning" title="Two safety points">
      At 356 °F and again at 395 °F bean temperature, the Hottop beeps and shows <strong>Enter</strong>. Press it to keep
      roasting, or the beans are ejected and cooling starts.
    </Callout>

    <H2 id="setup">Set up Roast Timer</H2>
    <Steps>
      <Step title="Choose the Hottop">
        <p>
          Open <Link to="/roast?roaster=hottop-kn8828">the timer</Link> and pick <Ui>Hottop KN-8828B-2K+</Ui>.
        </p>
      </Step>
      <Step title="Set the starting heat and fan">
        <p>
          Set <Ui>Heat</Ui> and <Ui>Fan</Ui> in percent to match what the panel shows. If the Hottop is in Auto mode,
          leave them and just log the moments.
        </p>
      </Step>
    </Steps>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Charge when the beans drop in">
        <p>
          Press <Ui>Charge — start timer</Ui> as the beans go into the drum. Right after charge the probe reading falls,
          then turns: tap <Ui>Turning point</Ui> at the lowest reading if you want it on record.
        </p>
      </Step>
      <Step title="Record bean temperature every 30–60 seconds">
        <p>
          Type the bean temperature (BT on the display) and press Enter (or <Ui>Log</Ui>). The environment temperature
          (ET) is optional. Regular
          readings are what make the curve and its rate of rise meaningful.
        </p>
      </Step>
      <Step title="Log every heat and fan change">
        <p>
          Press <Ui>+</Ui> or <Ui>−</Ui> on the matching control each time you change it on the roaster. That's the
          schedule you'll repeat.
        </p>
      </Step>
      <Step title="Tap yellowing and first crack, then drop">
        <p>
          Tap <Ui>Yellowing</Ui> and <Ui>First crack</Ui> as they happen. When you eject the beans into the cooling
          tray, tap <Ui>Drop</Ui>.
        </p>
      </Step>
    </Steps>

    <H2 id="ror">Reading rate of rise</H2>
    <p>
      Many roasters aim for an RoR that starts high and falls steadily all the way to the end. These ranges are a rough
      first reference for a medium roast on a small drum, not targets; your probe placement changes the numbers:
    </p>
    <RefTable
      caption="Rough rate of rise ranges by roast stage"
      columns={["Stage", "Rough RoR"]}
      rows={[
        ["Early roast", "8–12 °C/min"],
        ["Mid roast", "5–8 °C/min"],
        ["Approaching first crack", "3–5 °C/min"],
        ["Development", "2–4 °C/min"],
      ]}
    />
    <ul>
      <li>
        <strong>RoR flat or rising before first crack</strong> often leads to a harsh, rushed finish. Reduce heat a
        little earlier.
      </li>
      <li>
        <strong>RoR crashing towards zero</strong> means the roast is stalling, which tastes{" "}
        <Link to="/how-to/roast-defects">baked</Link>. Keep more heat going in through the middle of the roast.
      </li>
    </ul>

    <H2 id="starting-point">A starting point for manual control</H2>
    <p>About 250 g, aiming at a medium roast. Treat these as a first draft.</p>
    <RefTable
      caption="Example Hottop manual schedule"
      columns={["Time", "Heat", "Fan"]}
      rows={[
        ["0:00", "100%", "0%"],
        ["~5:00", "90%", "30%"],
        ["~9:00", "75%", "50%"],
        ["~10:30 (first crack)", "60%", "50%"],
        ["~12:30", "Eject", "–"],
      ]}
    />

    <Callout variant="tip">
      Same temperatures but a different RoR give a different cup. When repeating a roast, match the shape of the curve,
      not just the end temperature.
    </Callout>

    <RoasterLinks roaster="hottop-kn8828" />
  </DocsLayout>
);

export default HottopKN8828;
