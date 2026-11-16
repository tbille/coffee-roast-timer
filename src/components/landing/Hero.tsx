import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoasterPreference, saveRoasterPreference } from "@/utils/roasterPreferences";
import type { RoasterType } from "@/types/roaster.types";
import { ConsolePreview } from "./ConsolePreview";
import { LANDING_MACHINES } from "./machines";

const isListed = (id: RoasterType | null): id is RoasterType => !!id && LANDING_MACHINES.some((m) => m.id === id);

/** Promise (left) and proof (right): what it is, who it's for, and the real roast screen. */
export function Hero() {
  const navigate = useNavigate();
  const [roaster, setRoaster] = useState<RoasterType | "">(() => {
    const saved = getRoasterPreference();
    return isListed(saved) ? saved : "";
  });

  const start = (e: FormEvent) => {
    e.preventDefault();
    if (roaster) {
      saveRoasterPreference(roaster);
      navigate(`/roast?roaster=${roaster}`);
    } else {
      navigate("/roast");
    }
  };

  return (
    <section aria-labelledby="hero-title" className="px-4 pb-12 pt-10 sm:px-6 md:pb-16 md:pt-16">
      <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Free · works in your browser · no account needed
          </p>
          <h1 id="hero-title" className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            The roast companion for home roasters
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A clock you can read from across the garage, one tap for first crack, and every batch saved so you can roast
            it again.
          </p>

          <form onSubmit={start} className="mt-8 max-w-xl">
            <label htmlFor="hero-roaster" className="block text-sm font-medium text-foreground">
              Your roaster
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <select
                  id="hero-roaster"
                  value={roaster}
                  onChange={(e) => setRoaster(e.target.value as RoasterType | "")}
                  className="h-12 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-10 text-base text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <option value="">Choose your roaster</option>
                  {LANDING_MACHINES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 text-base">
                Start roasting
                <ArrowRight strokeWidth={1.75} aria-hidden />
              </Button>
            </div>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            Curious what others roast on your machine?{" "}
            <Link to="/discover" className="font-medium text-primary underline-offset-4 hover:underline">
              Browse community roasts
            </Link>
          </p>
        </div>

        <ConsolePreview />
      </div>
    </section>
  );
}
