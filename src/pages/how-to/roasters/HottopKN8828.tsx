import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { RoasterFacts, RoasterLinks } from "@/components/guides/RoasterFacts";
import { Callout, H2, RefTable, Step, Steps, Ui } from "@/components/guides/prose";

const HottopKN8828 = () => (
  <DocsLayout slug="hottop-kn-8828">
    <RoasterFacts roaster="hottop-kn8828" extra={[{ label: "You control", value: "Heat % and fan %" }]} />

    <H2 id="how-it-works">How the Hottop works</H2>
    <p>
      The Hottop is an electric drum roaster with a bean temperature probe. You can let it run its own program, or set
      heat and fan power yourself. Because it reads bean temperature, it's the one roaster where Roast Timer can show a
      live <strong>rate of rise</strong> (RoR): how many degrees per minute the beans are gaining.
    </p>

    <H2 id="setup">Set up Roast Timer</H2>
    <Steps>
      <Step title="Choose the Hottop">
        <p>
          Open <Link to="/roast?roaster=hottop-kn8828">the timer</Link> and pick <Ui>Hottop KN-8828</Ui> from the roaster
          menu.
        </p>
      </Step>
      <Step title="Pick the roast mode">
        <p>
          Under <Ui>Roast Mode</Ui>, choose <Ui>Auto Light</Ui>, <Ui>Auto Medium</Ui> or <Ui>Auto Dark</Ui> if the
          Hottop is running a program, or <Ui>Manual</Ui> if you'll set heat and fan yourself. Manual adds{" "}
          <Ui>Heat Power</Ui> and <Ui>Fan Speed</Ui> sliders, with quick presets from 0% to 100%.
        </p>
      </Step>
    </Steps>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Press Start Roast when the beans drop in">
        <p>Start the timer as the beans go into the drum.</p>
      </Step>
      <Step title="Record bean temperature every 30–60 seconds">
        <p>
          Type the bean temperature into <Ui>Bean Temp</Ui> and press <Ui>Record Temperature</Ui>. <Ui>Env Temp</Ui> is
          optional. Regular readings are what make the rate of rise meaningful.
        </p>
      </Step>
      <Step title="In Manual mode, log every heat and fan change">
        <p>Move the sliders to match the roaster each time you change it. That's the schedule you'll repeat.</p>
      </Step>
      <Step title="Watch the rate of rise">
        <p>
          The <Ui>Advanced Metrics</Ui> panel shows the current RoR and flags it as optimal, too fast, slow or stalling.
          See the ranges below.
        </p>
      </Step>
      <Step title="Mark first crack, then stop">
        <p>
          Press <Ui>First Crack</Ui> when it starts. When you eject the beans into the cooling tray, press{" "}
          <Ui>Stop</Ui>.
        </p>
      </Step>
    </Steps>

    <H2 id="ror">Reading rate of rise</H2>
    <p>
      A healthy roast has an RoR that starts high and falls steadily all the way to the end. These are the ranges Roast
      Timer uses:
    </p>
    <RefTable
      caption="Rate of rise guidelines by roast stage"
      columns={["Stage", "Target RoR"]}
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

    <H2 id="starting-point">A starting point for Manual mode</H2>
    <p>About 250 g, aiming at a medium roast. Treat these as a first draft.</p>
    <RefTable
      caption="Example Hottop manual schedule"
      columns={["Time", "Heat", "Fan"]}
      rows={[
        ["0:00", "100%", "0%"],
        ["~5:00", "90%", "25%"],
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
