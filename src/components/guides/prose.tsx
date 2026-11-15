import type { ReactNode } from "react";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small building blocks for docs articles. Articles are plain prose styled by
 * @tailwindcss/typography; these components cover the few things prose can't
 * express on its own (numbered procedures, asides, quick facts, tables).
 */

const anchorClass =
  "ml-2 text-muted-foreground no-underline opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100";

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="group">
      {children}
      <a href={`#${id}`} className={anchorClass} aria-label="Link to this section">
        #
      </a>
    </h2>
  );
}

export function H3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="group">
      {children}
      <a href={`#${id}`} className={anchorClass} aria-label="Link to this section">
        #
      </a>
    </h3>
  );
}

/** Numbered procedure. Each Step gets a counter bubble on a vertical rail. */
export function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className="not-prose my-8 ml-3.5 space-y-8 border-l border-border pl-8 [counter-reset:step]">
      {children}
    </ol>
  );
}

export function Step({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <li className="relative [counter-increment:step] before:absolute before:-left-[2.875rem] before:top-0 before:flex before:h-7 before:w-7 before:items-center before:justify-center before:rounded-full before:border before:border-border before:bg-secondary before:text-sm before:font-semibold before:text-secondary-foreground before:content-[counter(step)]">
      <h3 className="pt-0.5 font-semibold leading-snug text-foreground">{title}</h3>
      {children ? (
        <div className="prose prose-neutral mt-2 max-w-none prose-p:my-3 prose-ul:my-2 prose-li:my-0.5">
          {children}
        </div>
      ) : null}
    </li>
  );
}

const calloutStyles = {
  note: { icon: Info, className: "border-primary/40 bg-muted/60", label: "Note" },
  tip: { icon: Lightbulb, className: "border-accent bg-secondary/40", label: "Tip" },
  warning: {
    icon: AlertTriangle,
    className: "border-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.08)]",
    label: "Warning",
  },
} as const;

/** Aside. Use sparingly: one or two per page at most, warnings only for safety. */
export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: keyof typeof calloutStyles;
  title?: string;
  children: ReactNode;
}) {
  const { icon: Icon, className, label } = calloutStyles[variant];
  return (
    <aside
      role="note"
      aria-label={title ?? label}
      className={cn("not-prose my-6 flex gap-3 rounded-r-md border-l-4 px-4 py-3 text-[0.95rem] leading-relaxed", className)}
    >
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          variant === "warning" ? "text-[hsl(var(--warning))]" : "text-primary",
        )}
        aria-hidden
      />
      <div className="space-y-1.5 text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children}
      </div>
    </aside>
  );
}

/** Compact facts grid, e.g. a roaster's batch size and typical first crack. */
export function AtAGlance({
  items,
  title = "At a glance",
}: {
  items: { label: string; value: ReactNode }[];
  title?: string;
}) {
  return (
    <section aria-label={title} className="not-prose my-8 overflow-hidden rounded-lg border bg-card">
      <dl className="grid grid-cols-2 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="border-b border-r p-4 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(4n)]:border-r-0">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 font-semibold tabular-nums text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Reference table. On narrow screens tables with 3+ columns become stacked
 * label/value blocks instead of a squeezed, sideways-scrolling grid.
 */
export function RefTable({
  columns,
  rows,
  caption,
}: {
  columns: string[];
  rows: ReactNode[][];
  caption?: string;
}) {
  const stackOnMobile = columns.length > 2;
  return (
    <>
      <div className={cn("not-prose my-6 overflow-x-auto rounded-md border", stackOnMobile && "hidden sm:block")}>
        <table className="w-full text-left text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-muted/50">
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, i) => (
              <tr key={i} className="align-top">
                {row.map((cell, j) => (
                  <td key={j} className={cn("px-4 py-3 leading-relaxed", j === 0 && "font-medium text-foreground")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {stackOnMobile ? (
        <ul className="not-prose my-6 divide-y rounded-md border sm:hidden" aria-label={caption}>
          {rows.map((row, i) => (
            <li key={i} className="px-4 py-3 text-sm">
              <p className="font-semibold text-foreground">{row[0]}</p>
              <dl className="mt-1.5 space-y-1">
                {row.slice(1).map((cell, j) => (
                  <div key={j}>
                    <dt className="inline text-muted-foreground">{columns[j + 1]}: </dt>
                    <dd className="inline leading-relaxed text-foreground">{cell}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function Formula({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="not-prose my-6">
      <div className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-sm text-foreground">{children}</div>
      {caption ? <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}

/** Inline reference to a control in the app UI, e.g. <Ui>Save Roast</Ui>. */
export function Ui({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}
