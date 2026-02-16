import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  title: string | ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  headerActions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
  headerActions,
  className,
  contentClassName,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={cn("shadow-coffee", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle 
          as="h2" 
          className="cursor-pointer flex-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {headerActions}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 p-0"
            aria-label={isOpen ? "Collapse section" : "Expand section"}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className={contentClassName}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}
