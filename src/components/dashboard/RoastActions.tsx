import { useState } from "react";
import { Link } from "react-router";
import { MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface RoastActionsProps {
  title: string;
  roastAgainHref: string;
  onDelete: () => void;
}

const itemClass =
  "flex h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-hidden";

/** Owner kebab on a RoastCard: Roast again, Delete (the caller confirms). */
export function RoastActions({ title, roastAgainHref, onDelete }: RoastActionsProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11 hover:bg-muted" aria-label={`Actions for ${title}`}>
          <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        <Link to={roastAgainHref} className={itemClass} onClick={() => setOpen(false)}>
          <RotateCcw className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Roast again
        </Link>
        <button
          type="button"
          className={`${itemClass} text-destructive`}
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );
}
