import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Small uppercase label above the title */
  eyebrow?: ReactNode;
  /** Rendered as the page H1 */
  title: ReactNode;
  description?: ReactNode;
  /** Buttons / links aligned right on wide screens, below the text on phones */
  actions?: ReactNode;
  className?: string;
  /** Id for the H1, e.g. to label a section with aria-labelledby */
  titleId?: string;
}

/** Left-aligned page header used on every top-level page. */
export function PageHeader({ eyebrow, title, description, actions, className, titleId }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6", className)}>
      <div className="min-w-0 space-y-2">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
        )}
        <h1 id={titleId} className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && <p className="max-w-2xl text-base text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
