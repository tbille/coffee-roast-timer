import { Link } from "react-router-dom";
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
          Open <Link to="/roast?roaster=gene-cbr-101">the timer</Link> and pick <Ui>Gene CBR-101</Ui> from the roaster
          menu. Choose °C or °F to match your display.
        </p>
      </Step>
      <Step title="Set your batch size">
        <p>Enter the green weight. The app warns you if you go over what the drum handles evenly.</p>
      </Step>
      <Step title="Set the starting target temperature">
        <p>
          Type it in or use the <Ui>-5°</Ui> and <Ui>+5°</Ui> buttons, so it matches what you dial in on the roaster.
        </p>
      </Step>
    </Steps>

    <H2 id="during">During the roast</H2>
    <Steps>
      <Step title="Press Start Roast when you start the Gene Cafe">
        <p>Load the drum and start both at the same moment.</p>
      </Step>
      <Step title="Record a reading whenever something changes">
        <p>
          When you change the target on the roaster, change it in the app too. Type the temperature the display shows
          and press <Ui>Record Temperature</Ui>. Each entry saves both the target and the reading, which builds your
          temperature curve. Every minute or so is plenty.
        </p>
      </Step>
      <Step title="Watch the color through the drum">
        <p>Green turns to yellow, then tan, then brown. Logging when the beans turn yellow helps you split the phases.</p>
      </Step>
      <Step title="Mark first crack, then stop">
        <p>
          Press <Ui>First Crack</Ui> when it starts. When you reach your color, press the cool button on the roaster and{" "}
          <Ui>Stop</Ui> in the app.
        </p>
      </Step>
    </Steps>

    <H2 id="starting-point">A starting point</H2>
    <p>
      A common approach for a medium roast with about 225 g: run at or near the maximum until close to first crack, then
      step down to slow the finish. Your numbers will vary with beans and room temperature.
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
      room temperature in your roast notes so you can account for it.
    </Callout>

    <RoasterLinks roaster="gene-cbr-101" />
  </DocsLayout>
);

export default GeneCafeCBR101;
