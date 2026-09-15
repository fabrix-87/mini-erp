import React from "react";
import { cn } from "@/lib/utils";

interface DataRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  horizontal?: boolean;
}

export function DataRow({ label, value, className, horizontal = true }: DataRowProps) {
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
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right text-foreground truncate">{value}</span>
    </div>
  );
}
