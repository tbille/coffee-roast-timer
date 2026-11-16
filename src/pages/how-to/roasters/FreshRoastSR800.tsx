import { Link } from "react-router";
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
      Heat and fan each have nine steps, 1 to 9. Out of the box the roaster starts at heat 9, fan 5 with the timer at
      6.0 minutes; the manual explains how to change those defaults, so check what yours shows. Roast Timer uses the
      same numbers, so “Heat 7, Fan 5” in the app is exactly what you set on the roaster, and anyone else with an SR800
      can repeat it.
    </p>

    <p>
      The roaster's own timer counts down in tenths of a minute, up to 20 minutes, and switches to cool when it reaches
      zero. Set it longer than you need and press cool yourself; Roast Timer keeps the real clock. The optional
      extension tube helps the beans move but doesn't raise the 8 oz (226 g) batch limit.
    </p>

    <Callout variant="warning" title="Stay with it">
      Air roasters are fast and throw chaff. Roast under an extractor or outdoors, keep the chaff collector clean, and
      never leave the SR800 running unattended.
    </Callout>

    <H2 id="setup">Set up Roast Timer</H2>
    <Steps>
      <Step title="Choose the SR800">
        <p>
          Open <Link to="/roast?roaster=freshroast-sr800">the timer</Link> and pick <Ui>FreshRoast SR800</Ui>.
        </p>
      </Step>
      <Step title="Enter your batch weight and starting dials">
        <p>
          Set the starting <Ui>Heat</Ui> and <Ui>Fan</Ui> (1–9) to match the roaster before you charge.
        </p>
      </Step>
    </Steps>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Charge when the beans go in">
        <p>
          Press <Ui>Charge — start timer</Ui> as you start the roaster. Things move fast on an air roaster, so keep the
          phone or tablet within reach.
        </p>
      </Step>
      <Step title="Log every dial change">
        <p>
          Each time you turn heat or fan on the roaster, press <Ui>+</Ui> or <Ui>−</Ui> on the matching control in the
          app. Every step is logged with its time and becomes your schedule for next time.
        </p>
      </Step>
      <Step title="Lower the fan as the beans lighten">
        <p>
          Beans lose water and get lighter as they roast. Reduce the fan once they're moving freely, so they don't fly up
          the chamber and the roast keeps its pace. Too much fan carries heat away and can stall the roast before first
          crack.
        </p>
      </Step>
      <Step title="Tap yellowing and first crack, then drop">
        <p>
          Tap <Ui>Yellowing</Ui> and <Ui>First crack</Ui> as they happen. When you reach your color, switch the roaster
          to cool and tap <Ui>Drop</Ui>.
        </p>
      </Step>
    </Steps>

    <H2 id="starting-point">A starting point</H2>
    <p>
      For about 120 g aiming at a medium roast. A common approach is to start with high fan to move the dense green
      beans, then bring the fan down as they lighten. Adjust for your beans, voltage and room.
    </p>
    <RefTable
      caption="Example SR800 heat and fan schedule"
      columns={["Time", "Heat", "Fan", "Why"]}
      rows={[
        ["0:00", "9", "9", "Keep the dense green beans moving"],
        ["~1:30", "9", "7", "Beans moving freely; let them hold more heat"],
        ["~3:30", "9", "6", "Push through drying into Maillard"],
        ["~6:00", "7", "6", "First crack starts: ease off so it doesn't run away"],
        ["~8:00", "Cool", "–", "Drop: about 2 minutes of development"],
      ]}
    />
    <Callout variant="tip" title="Roasts too fast?">
      Raise the fan a step or lower the heat early on. If first crack still comes before 5 minutes, try a slightly
      bigger batch. Too slow, or stalling before first crack? Lower the fan a step.
    </Callout>

    <RoasterLinks roaster="freshroast-sr800" />
  </DocsLayout>
);

export default FreshRoastSR800;
