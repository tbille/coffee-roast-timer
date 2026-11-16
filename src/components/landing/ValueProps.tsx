import { NotebookPen, Repeat2, Timer, type LucideIcon } from "lucide-react";

const PROPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Timer,
    title: "Roast",
    text: "One big button for the next moment: yellowing, first crack, drop. The phase ribbon fills in from your taps, the controls match your machine's dials, and the screen stays on.",
  },
  {
    icon: NotebookPen,
    title: "Review",
    text: "When you drop, type the weight out and see the weight loss next to total time, first crack and development. Add the bean, roast level and a note. Saved on your device, no account needed.",
  },
  {
    icon: Repeat2,
    title: "Repeat",
    text: "Pick any saved roast, yours or one from Discover, and roast it again with its first crack and drop as ghost markers and a live “+0:18” to tell you if you're ahead or behind.",
  },
];

export function ValueProps() {
  return (
    <section aria-labelledby="how-it-works" className="border-t px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 id="how-it-works" className="text-2xl font-semibold tracking-tight">
          Roast, review, repeat
        </h2>
        <ul className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {PROPS.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon className="h-6 w-6 text-primary" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
