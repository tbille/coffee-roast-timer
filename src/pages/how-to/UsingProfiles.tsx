import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { Callout, H2, RefTable, Step, Steps, Ui } from "@/components/guides/prose";

const UsingProfiles = () => (
  <DocsLayout slug="using-profiles">
    <p>
      Use this guide when you've roasted something you liked and want to do it again, or when two roasts of the same
      coffee came out differently and you want to know why.
    </p>

    <H2 id="read-a-profile">What a profile shows</H2>
    <p>Open any roast from your dashboard or from Discover. The page is laid out top to bottom like this:</p>
    <RefTable
      caption="Sections of a roast profile page"
      columns={["Section", "What it tells you"]}
      rows={[
        [
          "Summary",
          <>
            <strong>Total time</strong>, <strong>First crack</strong>, <strong>Development</strong> (time and ratio) and{" "}
            <strong>Weight loss</strong>, plus a bar showing how long each phase lasted.
          </>,
        ],
        ["Tasting notes", "Score, flavor tags and notes added after tasting."],
        ["Temperature curve", "Every temperature you logged, plotted over time. Switch between °C and °F."],
        ["Roast steps", "Each event and setting change, in order, with its time. This is your plan for the next roast."],
        ["Beans & setup", "Coffee, origin, batch weight, roaster and any notes saved with the roast."],
      ]}
    />
    <p>
      Not sure what a number means? The <Link to="/how-to/roast-numbers">glossary</Link> covers each one.
    </p>

    <H2 id="repeat">Repeat a roast</H2>
    <Steps>
      <Step title="Open the roast you want to repeat">
        <p>
          Find it on your <Link to="/dashboard">dashboard</Link>, or on <Link to="/discover">Discover</Link> if you're
          starting from someone else's roast. Filter by roaster to keep it relevant to your machine.
        </p>
      </Step>
      <Step title="Note the three numbers that matter most">
        <p>
          Write down the <strong>first crack</strong> time, the <strong>development</strong> time and the{" "}
          <strong>batch</strong> weight. If you hit those three, most of the roast follows.
        </p>
      </Step>
      <Step title="Start the roast from the profile">
        <p>
          Press <Ui>Roast this on …</Ui> at the top of the profile. The timer opens with the same roaster selected. Keep
          the profile open in a second tab or on another device so you can follow its <Ui>Roast steps</Ui>.
        </p>
      </Step>
      <Step title="Follow the steps, then adjust to what you see">
        <p>
          Make each setting change at roughly the time it happened in the original. If you're running behind or ahead at
          first crack, don't force it: note the difference and adjust next time. Room temperature and bean moisture
          change roasts, so treat the profile as a guide.
        </p>
      </Step>
      <Step title="Save with the same beans name">
        <p>Using the same name makes the two roasts easy to find and compare later.</p>
      </Step>
    </Steps>

    <H2 id="compare">Compare two roasts</H2>
    <p>Comparison puts two roasts side by side: their curves on one chart, and their numbers in one table.</p>
    <Steps>
      <Step title="Open the comparison">
        <p>
          On your dashboard, press <Ui>Compare Profiles</Ui> (it appears once you have two saved roasts). Or open one of
          your roasts and press <Ui>Compare</Ui> to start with that roast already selected.
        </p>
      </Step>
      <Step title="Pick the roasts">
        <p>
          Press <Ui>Add Profile</Ui> and search by beans, origin, roaster or user. You can compare with anyone's
          public roast, not just your own.
        </p>
      </Step>
      <Step title="Read the differences">
        <p>
          Start with first crack time, then development time, then weight loss. The first one that differs a lot is
          usually the reason the cups tasted different.
        </p>
      </Step>
    </Steps>

    <Callout variant="tip">
      Timing is more portable than temperature. Thermometers differ between machines, so “first crack at 10:30” carries
      over to another roaster better than “first crack at 196 °C”.
    </Callout>

    <H2 id="other-actions">Other things you can do with a profile</H2>
    <ul>
      <li>
        <Ui>Share</Ui> copies a link to the roast.
      </li>
      <li>
        <Ui>Like</Ui> (the thumbs up) tells the person who roasted it that their profile helped.
      </li>
      <li>
        <Ui>Edit</Ui> fixes the bean name, origin, process, farm or weights on your own roasts.
      </li>
      <li>
        <Ui>Add cupping</Ui> attaches tasting notes. See <Link to="/how-to/cupping-notes">Add tasting notes</Link>.
      </li>
    </ul>
  </DocsLayout>
);

export default UsingProfiles;
