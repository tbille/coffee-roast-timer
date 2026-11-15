import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { RoasterFacts, RoasterLinks } from "@/components/guides/RoasterFacts";
import { Callout, H2, RefTable, Step, Steps, Ui } from "@/components/guides/prose";

const FreshRoastSR800 = () => (
  <DocsLayout slug="freshroast-sr800">
    <RoasterFacts roaster="freshroast-sr800" extra={[{ label: "You control", value: "Heat and fan" }]} />

    <H2 id="how-it-works">How the SR800 works</H2>
    <p>
      Hot air is blown up through the beans, which both heats them and keeps them moving. That gives you two levers that
      interact:
    </p>
    <ul>
      <li>
        <strong>Heat</strong> sets how hot the air is.
      </li>
      <li>
        <strong>Fan</strong> sets how much air moves. More fan cools the beans and slows the roast; less fan lets them
        get hotter and speeds it up.
      </li>
    </ul>
    <p>
      The SR800 has nine steps on each dial. Roast Timer logs them as <strong>Low</strong>, <strong>Medium</strong> and{" "}
      <strong>High</strong>, so decide once how your dial numbers map to those (for example 1–3, 4–6, 7–9) and note it
      in your roast notes.
    </p>

    <H2 id="setup">Set up Roast Timer</H2>
    <Steps>
      <Step title="Choose the SR800">
        <p>
          Open <Link to="/roast?roaster=freshroast-sr800">the timer</Link> and pick <Ui>FreshRoast SR800</Ui> from the
          roaster menu.
        </p>
      </Step>
      <Step title="Enter your batch weight and starting settings">
        <p>
          Set <Ui>HEAT LEVEL</Ui> and <Ui>FAN SPEED</Ui> to match the roaster before you start.
        </p>
      </Step>
    </Steps>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Press Start Roast when the beans go in">
        <p>Things move fast on an air roaster, so keep the phone or tablet within reach.</p>
      </Step>
      <Step title="Log every dial change">
        <p>
          Each time you change heat or fan on the roaster, tap the matching level in the app. The{" "}
          <Ui>Change History</Ui> list fills up as you go and becomes your schedule for next time.
        </p>
      </Step>
      <Step title="Lower the fan as the beans lighten">
        <p>
          Beans lose water and get lighter as they roast. Reduce the fan once they're moving freely, so they don't fly up
          the chamber, and the roast keeps its pace.
        </p>
      </Step>
      <Step title="Mark first crack, then stop">
        <p>
          Press <Ui>First Crack</Ui> when it starts. When you reach your color, switch the roaster to cool and press{" "}
          <Ui>Stop</Ui>.
        </p>
      </Step>
    </Steps>

    <H2 id="starting-point">A starting point</H2>
    <p>For about 120 g aiming at a medium roast. Adjust for your beans, voltage and room.</p>
    <RefTable
      caption="Example SR800 heat and fan schedule"
      columns={["Time", "Heat", "Fan", "Why"]}
      rows={[
        ["0:00", "Medium", "High", "Keep the dense green beans moving"],
        ["2:00", "High", "Medium", "Beans are lighter; push heat through drying"],
        ["~5:30", "High", "Medium", "First crack starts"],
        ["6:30", "Medium", "Medium", "Slow the finish so the inside catches up"],
        ["~8:00", "Cool", "–", "Drop: about 2:30 of development"],
      ]}
    />
    <Callout variant="tip" title="Roasts too fast?">
      Raise the fan a step or lower the heat early on. If first crack still comes before 5 minutes, try a slightly
      bigger batch.
    </Callout>

    <RoasterLinks roaster="freshroast-sr800" />
  </DocsLayout>
);

export default FreshRoastSR800;
