import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { Callout, H2, Step, Steps, Ui } from "@/components/guides/prose";

const GettingStarted = () => (
  <DocsLayout slug="getting-started">
    <p>
      This walkthrough follows one roast from charge to drop. You don't need an account: the roast is kept on your device,
      and you can sign in later to sync it. The steps are the same on every supported roaster; only the machine controls
      in the middle of the roast screen change.
    </p>

    <Callout variant="warning" title="Safety first">
      Roasting makes smoke and chaff, and beans can catch fire if they're left too long. Roast outdoors or under a strong
      extractor, keep anything flammable away, and never leave the roaster unattended while it's on.
    </Callout>

    <H2 id="before-you-start">Before you start</H2>
    <ul>
      <li>Your roaster, set up and ready to preheat if your machine needs it.</li>
      <li>Green coffee, weighed on a kitchen scale.</li>
      <li>Something to cool the beans in: a metal colander or sieve works.</li>
      <li>A phone, tablet or laptop you can keep next to the roaster, plugged in if the roast is long.</li>
    </ul>

    <H2 id="setup">Set up the roast</H2>
    <Steps>
      <Step title="Open the timer and pick your roaster">
        <p>
          Go to <Link to="/roast">Roast</Link> and choose your machine. The starting settings below change to match it:
          heat and fan 1–9 on a FreshRoast SR800, weight and program on a Behmor, the setpoint on a Gene Cafe, and so
          on. Coming from a roaster guide or the home page, your machine is already selected.
        </p>
      </Step>
      <Step title="Enter the batch weight and starting settings">
        <p>
          Type the green weight in grams. The app shows the range your machine handles and only warns you above it. Then
          set the starting settings to what you've dialed in on the roaster.
        </p>
      </Step>
    </Steps>

    <H2 id="roast">Roast</H2>
    <Steps>
      <Step title="Charge: start the timer when the beans go in">
        <p>
          <strong>Charge</strong> is the moment the beans meet the heat, and it's time zero. Press{" "}
          <Ui>Charge — start timer</Ui> as you load them. The screen switches to the roast view: a big clock, a phase
          ribbon and one large button for the next moment. The screen stays on while you roast.
        </p>
      </Step>
      <Step title="Tap yellowing">
        <p>
          A few minutes in, the beans turn from green to pale yellow and smell like hay or bread. Tap the big button, which reads{" "}
          <Ui>Yellowing</Ui>. That splits the roast into <strong>drying</strong> and <strong>Maillard</strong> on the
          ribbon. Missed it? <Ui>Skip yellowing</Ui> moves on, and you can add the time afterwards.
        </p>
      </Step>
      <Step title="Log what you change">
        <p>
          Each time you turn a dial or press a button on the roaster, tap the matching control on screen. Each tap is
          logged with its time, and that log is what you'll follow next time. On your very first roast you can skip this
          and just watch.
        </p>
      </Step>
      <Step title="Tap first crack">
        <p>
          Listen for a crackle like popcorn. When you hear several cracks close together (not a single stray pop), tap{" "}
          <Ui>First crack</Ui>. From here the status line under the clock shows <strong>development</strong> time and
          its share of the roast, live. <Ui>Second crack</Ui> becomes available as a smaller button; most light and
          medium roasts end before it.
        </p>
      </Step>
      <Step title="Drop when the beans reach your color">
        <p>
          Empty the beans to cool and tap <Ui>Drop</Ui>. The clock stops. Dropped by accident? <Ui>Undo</Ui> stays on
          screen for a few seconds and carries on as if nothing happened.
        </p>
      </Step>
    </Steps>

    <Callout variant="tip" title="Keyboard">
      On a laptop, Space or Enter presses the big button, and Y, F, S and D mark yellowing, first crack, second crack
      and drop. Press ? on the roast screen for the full list.
    </Callout>

    <H2 id="save">Fill in the post-roast card</H2>
    <p>
      After the drop, the roast screen turns into a post-roast card. The roast is already kept on this device, so nothing
      is lost if you walk away.
    </p>
    <Steps>
      <Step title="Weigh the roasted beans">
        <p>
          Type the <Ui>Weight out</Ui>. The card shows the <strong>weight loss</strong> straight away, next to total
          time, first crack and development. Weight loss is one of the best clues to how dark the roast went.
        </p>
      </Step>
      <Step title="Add what you'll want to remember">
        <p>
          Bean name, origin, process, roast level, where you roasted and notes are all optional. Tapped first crack late?
          Fix the time in the events list.
        </p>
      </Step>
      <Step title="Save">
        <p>
          Press <Ui>Save</Ui>. Signed out, the roast stays on this device; signed in, it syncs to your account. Roasting
          another batch straight away? <Ui>Next batch</Ui> saves this one and sets it up as the reference for the next.
        </p>
      </Step>
    </Steps>

    <Callout title="Your roasts are private until you share them">
      Under <Ui>Who can see it</Ui>, keep a roast <Ui>Private</Ui> (only you), make it <Ui>Link only</Ui> (anyone with
      the link) or <Ui>Public</Ui>, which lists it on <Link to="/discover">Discover</Link> so other people with the same
      roaster can learn from it. You can change it later on the roast's page.
    </Callout>

    <H2 id="what-you-learned">What you just did</H2>
    <p>
      You now have a complete record of one roast: when the beans yellowed, when first crack came, how long you
      developed them after it, and what you changed along the way. You'll find it in{" "}
      <Link to="/roasts">My roasts</Link>, grouped with other roasts of the same bean.
    </p>
    <p>
      Once the coffee has rested for a few days, taste it and{" "}
      <Link to="/how-to/cupping-notes">add tasting notes</Link>. Then <Ui>Roast again</Ui> follows this roast as a live
      reference on your next batch: <Link to="/how-to/using-profiles">Roast it again</Link> shows you how. New words?
      The <Link to="/how-to/roast-numbers">glossary</Link> defines each one.
    </p>
  </DocsLayout>
);

export default GettingStarted;
