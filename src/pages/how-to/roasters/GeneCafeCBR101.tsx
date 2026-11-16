import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { RoasterFacts, RoasterLinks } from "@/components/guides/RoasterFacts";
import { Callout, H2, RefTable, Step, Steps, Ui } from "@/components/guides/prose";

const GeneCafeCBR101 = () => (
  <DocsLayout slug="gene-cafe-cbr-101">
    <RoasterFacts roaster="gene-cbr-101" extra={[{ label: "You control", value: "Air temperature" }]} />

    <H2 id="how-it-works">How the Gene Cafe works</H2>
    <p>
      You set a target temperature and the Gene Cafe holds its hot air at that level while the drum rotates off-axis. The
      temperature on the display is the <strong>air</strong> temperature, not the bean temperature, so it reads much
      higher than the beans actually are. Use it to repeat your own roasts, not to compare with other machines.
    </p>

    <H2 id="setup">Set up Roast Timer</H2>
    <Steps>
      <Step title="Choose the Gene Cafe">
        <p>
          Open <Link to="/roast?roaster=gene-cbr-101">the timer</Link> and pick <Ui>Gene Cafe CBR-101</Ui>. Choose °C or °F to
          match your display.
        </p>
      </Step>
      <Step title="Set your batch size">
        <p>Enter the green weight. The app only warns you if you go over what the drum handles evenly.</p>
      </Step>
      <Step title="Set the starting target temperature">
        <p>
          Set the <Ui>Setpoint</Ui> to what you dial in on the roaster. The TEMP dial moves one degree at a time, up to
          250 °C (482 °F), and the app does the same. Set the roast time on the TIME dial as usual: up to 30 minutes in
          6-second steps, and you can turn it up during the roast to add time.
        </p>
      </Step>
    </Steps>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Charge when you start the Gene Cafe">
        <p>
          Load the drum and press <Ui>Charge — start timer</Ui> as you start the roaster.
        </p>
      </Step>
      <Step title="Log every setpoint change">
        <p>
          When you turn the dial on the roaster, change the setpoint in the app too. Each change is logged with its time.
          If you want a curve, also type the temperature the display shows into the temperature field and press Enter;
          every minute or so is plenty. It's optional.
        </p>
      </Step>
      <Step title="Watch the color through the drum">
        <p>
          Green turns to yellow, then tan, then brown. Tap <Ui>Yellowing</Ui> when they turn yellow: that splits the
          phase ribbon into drying and Maillard. Beans hitting the glass can sound like cracks, so listen for a steady
          run of cracking.
        </p>
      </Step>
      <Step title="Tap first crack, then drop">
        <p>
          Tap <Ui>First crack</Ui> when it starts. When you reach your color, press the cool button on the roaster and{" "}
          <Ui>Drop</Ui> in the app.
        </p>
      </Step>
    </Steps>

    <H2 id="starting-point">A starting point</H2>
    <p>
      The manual's roasting guide uses 230–250 °C, with 12 to 23 minutes depending on how dark you go. A common approach
      for a medium roast with about 225 g: run at or near the maximum until close to first crack, then step down to slow
      the finish. Your numbers will vary with beans, voltage and room temperature.
    </p>
    <RefTable
      caption="Example Gene Cafe schedule for a medium roast"
      columns={["Time", "Target", "What's happening"]}
      rows={[
        ["0:00", "245 °C", "Charge; beans drying"],
        ["~5:00", "245 °C", "Beans turn yellow"],
        ["~9:30", "240 °C", "Approaching first crack: ease off slightly"],
        ["~10:30", "230 °C", "First crack starts"],
        ["~12:30", "–", "Drop and cool (about 2 minutes of development)"],
      ]}
    />
    <Callout variant="tip" title="Cold room?">
      The Gene Cafe is sensitive to room temperature. On a cold day first crack can arrive a few minutes later. Note the
      room temperature on the post-roast card (where you roasted, plus the ambient temperature) so you can account for
      it. Keep the chaff collector clean and stay with the roaster.
    </Callout>

    <RoasterLinks roaster="gene-cbr-101" />
  </DocsLayout>
);

export default GeneCafeCBR101;
