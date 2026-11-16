import { Link } from "react-router";
import { DocsLayout } from "@/components/guides/DocsLayout";
import { Callout, H2, RefTable, Step, Steps, Ui } from "@/components/guides/prose";

const UsingProfiles = () => (
  <DocsLayout slug="using-profiles">
    <p>
      Use this guide when you've roasted something you liked and want to do it again, or when two roasts of the same
      coffee came out differently and you want to know why. The roast you follow is called the <strong>reference</strong>
      .
    </p>

    <H2 id="read-a-roast">What a saved roast shows</H2>
    <p>
      Open any roast from <Link to="/roasts">My roasts</Link> or from <Link to="/discover">Discover</Link>. The page is
      laid out top to bottom like this:
    </p>
    <RefTable
      caption="Sections of a saved roast page"
      columns={["Section", "What it tells you"]}
      rows={[
        [
          "Summary",
          <>
            <strong>Total</strong>, <strong>First crack</strong>, <strong>Development</strong> (time and share of the
            roast) and <strong>Loss</strong>, plus a bar showing how long each phase lasted.
          </>,
        ],
        ["Tasting notes", "Score, flavor tags and notes added after tasting."],
        ["Temperature curve", "Shown when at least a few temperatures were logged, plotted over time in °C or °F."],
        ["Roast steps", "Each moment and control change, in order, with its time. This is what Roast again follows."],
        ["Beans and setup", "Coffee, origin, process, roast level, batch weight, roaster and any notes."],
      ]}
    />
    <p>
      Not sure what a number means? The <Link to="/how-to/roast-numbers">glossary</Link> covers each one.
    </p>

    <H2 id="repeat">Roast it again</H2>
    <Steps>
      <Step title="Open the roast you want to repeat">
        <p>
          Find it in <Link to="/roasts">My roasts</Link>, or on <Link to="/discover">Discover</Link> if you're
          starting from someone else's roast. Filter Discover by roaster to keep it relevant to your machine.
        </p>
      </Step>
      <Step title="Press Roast again">
        <p>
          <Ui>Roast again</Ui> opens the timer on the same machine with that roast as the reference. The setup screen
          shows what you're following (bean and date) and its yellowing, first crack and drop times. Press{" "}
          <Ui>Clear</Ui> if you change your mind.
        </p>
      </Step>
      <Step title="Charge and roast as usual">
        <p>
          On the roast screen, the reference's yellowing, first crack and drop appear as dashed ghost marks above the
          phase ribbon. When you tap a moment, the status line tells you how you compare, for example{" "}
          <strong>“First crack +0:18 vs reference”</strong> (18 seconds later) or <strong>“On pace”</strong>.
        </p>
      </Step>
      <Step title="Adjust to what you see, not just the clock">
        <p>
          Make each control change at roughly the time it happened in the reference. If you're running behind or ahead
          at first crack, don't force it: note the difference and adjust next time. Room temperature, voltage and bean
          moisture all move roasts, so treat the reference as a guide.
        </p>
      </Step>
      <Step title="Save with the same bean name">
        <p>Using the same name groups the two roasts together in My roasts and makes them easy to compare.</p>
      </Step>
    </Steps>

    <Callout variant="tip" title="Roasting several batches in a row">
      On the post-roast card, <Ui>Next batch</Ui> saves the roast you just finished and goes straight back to setup with
      it as the reference and the same machine settings.
    </Callout>

    <H2 id="compare">Compare two roasts</H2>
    <p>Comparison puts two roasts side by side: their curves on one chart, and their numbers in one table.</p>
    <Steps>
      <Step title="Open the comparison">
        <p>
          From <Link to="/roasts">My roasts</Link>, press <Ui>Compare</Ui>. Or open one of your roasts and press{" "}
          <Ui>Compare</Ui> to start with that roast already picked. Comparison needs you to be signed in.
        </p>
      </Step>
      <Step title="Pick the two roasts">
        <p>Search by bean, origin or roaster. You can compare with anyone's public roast, not just your own.</p>
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

    <H2 id="other-actions">Other things you can do with a roast</H2>
    <ul>
      <li>
        <Ui>Share</Ui> copies a link to the roast.
      </li>
      <li>
        <Ui>Like</Ui> (the thumbs up) tells the person who roasted it that it helped.
      </li>
      <li>
        <Ui>Edit</Ui> fixes the bean name, origin, process, farm or weights on your own roasts.
      </li>
      <li>
        <Ui>Add cupping</Ui> attaches tasting notes. See <Link to="/how-to/cupping-notes">Add tasting notes</Link>.
      </li>
      <li>
        <Ui>Export</Ui> in My roasts downloads all your roasts as CSV or JSON.
      </li>
    </ul>
  </DocsLayout>
);

export default UsingProfiles;
