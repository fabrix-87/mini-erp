import React from "react";
import { HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DataRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  horizontal?: boolean;
  tooltip?: string;
}

export function DataRow({ label, value, className, horizontal = true, tooltip }: DataRowProps) {
  // Ignora il rendering se il valore è null, undefined o stringa vuota
  if (value === null || value === undefined || value === "") return null;

  return (
    <div
      className={cn(
        "py-1.5 text-sm",
        horizontal ? "flex items-center justify-between gap-4" : "flex flex-col gap-1",
        className,
      )}
    >
      <span className="text-muted-foreground shrink-0 inline-flex items-center gap-1">
        {label}

        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                role="img"
                aria-label="Info"
                className="inline-flex cursor-help items-center justify-center"
              >
                <HelpCircle className="size-3.5" />
              </span>
            </TooltipTrigger>

            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </span>

      <span className="font-medium text-right text-foreground truncate">{value}</span>
    </div>
  );
}
