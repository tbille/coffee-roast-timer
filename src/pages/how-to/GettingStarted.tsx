import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { Callout, H2, Step, Steps, Ui } from "@/components/guides/prose";

const GettingStarted = () => (
  <DocsLayout slug="getting-started">
    <p>
      This walkthrough follows one roast from start to finish. You don't need an account to start: you'll only be asked
      to sign in when you save. Any of the six supported roasters works; the steps are the same and only the controls in
      the middle of the screen change.
    </p>

    <H2 id="before-you-start">Before you start</H2>
    <ul>
      <li>Your roaster, set up and ready to preheat.</li>
      <li>Green coffee, weighed. Write the weight down: you'll need it to work out weight loss.</li>
      <li>A kitchen scale for weighing the roasted beans afterwards.</li>
      <li>A phone, tablet or laptop you can keep next to the roaster.</li>
    </ul>

    <H2 id="roast">Time the roast</H2>
    <Steps>
      <Step title="Open the timer and pick your roaster">
        <p>
          Go to <Link to="/roast">Start roasting</Link>. Under the <Ui>Coffee Roast Monitor</Ui> heading, use the roaster
          menu to pick your machine. The controls below it change to match: temperature logging for the Gene Cafe, a
          profile menu for the Behmor, heat and fan for the FreshRoast, and so on.
        </p>
        <p>
          If your roaster isn't listed, pick <strong>Gene CBR-101</strong>. It's a general temperature-logging setup that
          works for any machine.
        </p>
      </Step>
      <Step title="Press Start Roast when the beans go in">
        <p>
          Press <Ui>Start Roast</Ui> at the moment the beans hit the heat. The clock starts. On a Behmor, the timer counts down
          alongside the machine instead.
        </p>
      </Step>
      <Step title="Log what you change">
        <p>
          Every time you turn a dial or read a thermometer, record it in the panel for your roaster. These entries become
          the step-by-step record you'll follow next time. You can skip this on your very first roast and just watch.
        </p>
      </Step>
      <Step title="Mark first crack">
        <p>
          Listen for a crackle like popcorn. When you hear several cracks close together (not a single stray pop), press{" "}
          <Ui>First Crack</Ui>. From now on the timer shows your development time and development ratio live.
        </p>
        <p>
          <Ui>Second Crack</Ui> unlocks after first crack. Most light and medium roasts end before it.
        </p>
      </Step>
      <Step title="Press Stop when you drop the beans">
        <p>
          When the beans reach the color you want, empty them to cool and press <Ui>Stop</Ui>. The save form opens.
        </p>
      </Step>
    </Steps>

    <H2 id="save">Save it as a profile</H2>
    <Steps>
      <Step title="Fill in the save form">
        <p>
          Only <Ui>Beans Name</Ui> is required. Add <Ui>Origin</Ui>, and both <Ui>Initial Weight</Ui> and{" "}
          <Ui>Final Weight</Ui> if you can: with both weights the app calculates weight loss, which is one of the best
          clues to how dark the roast went. The notes fields are for anything you'll want to remember, like the weather
          or a mistake.
        </p>
      </Step>
      <Step title="Sign in if asked">
        <p>
          Press <Ui>Save Roast Profile</Ui>. If you aren't signed in, the form asks you to create an account or sign in
          with your email and a password. Once you're in, the roast saves automatically.
        </p>
      </Step>
      <Step title="Find your roast">
        <p>
          You land on <Ui>My Roast Profiles</Ui> (your <Link to="/dashboard">dashboard</Link>). Open the roast to see its
          summary, temperature curve and the steps you logged.
        </p>
      </Step>
    </Steps>

    <Callout title="Saved roasts are public">
      Every saved roast appears on <Link to="/discover">Discover</Link> so other people with the same roaster can learn
      from it. Keep anything private out of the notes fields.
    </Callout>

    <H2 id="what-you-learned">What you just did</H2>
    <p>
      You now have a complete record of one roast: when first crack happened, how long you developed the beans after it,
      and what you changed along the way. That record is what makes the next batch better.
    </p>
    <p>
      Once the coffee has rested for a few days, taste it and{" "}
      <Link to="/how-to/cupping-notes">add tasting notes</Link>. Then use the profile as the plan for your next roast:{" "}
      <Link to="/how-to/using-profiles">repeat or compare a roast</Link> shows you how.
    </p>
  </DocsLayout>
);

export default GettingStarted;
