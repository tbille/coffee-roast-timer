import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { LANDING_MACHINES } from "./machines";

const COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/** One tile per machine with a dedicated console mode. Generated, so the count is always honest. */
export function MachinesGrid() {
  const count = LANDING_MACHINES.length;
  return (
    <section aria-labelledby="machines-title" className="border-t px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 id="machines-title" className="text-2xl font-semibold tracking-tight">
          Speaks your machine's language
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The roast screen changes for each of these {COUNT_WORDS[count] ?? count} roasters, so what you log is what you
          turned on the machine. Each one has a guide with starting numbers.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_MACHINES.map(({ id, name, icon: Icon, text, batch, guidePath }) => (
            <li
              key={id}
              className="group relative flex flex-col rounded-lg border bg-card p-5 transition-colors duration-150 hover:border-primary/40"
            >
              <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-3 font-semibold leading-snug">
                {guidePath ? (
                  <Link
                    to={guidePath}
                    className="outline-hidden after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring group-hover:text-primary"
                  >
                    {name}
                  </Link>
                ) : (
                  name
                )}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{batch}</span>
                <Link
                  to={`/roast?roaster=${id}`}
                  className="relative z-10 inline-flex items-center gap-1 rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Start a roast on the ${name}`}
                >
                  Start
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-muted-foreground">
          New to roasting?{" "}
          <Link to="/how-to/getting-started" className="font-medium text-primary underline-offset-4 hover:underline">
            Your first roast, step by step
          </Link>{" "}
          walks through one batch from charge to drop.
        </p>
      </div>
    </section>
  );
}
