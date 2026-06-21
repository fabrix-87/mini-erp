"use client"

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface InfoCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  canCopy?: boolean;
}

export default function InfoCard({ label, value, icon: Icon, canCopy = false }: InfoCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value.replace("#", ""));
    setCopied(true);
    toast.success("Copiato negli appunti");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-border/50 bg-muted/30 dark:bg-muted/10 hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors duration-200">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5 text-muted-foreground/70" />
        {label}
      </div>
      <div className="flex items-center justify-between gap-2 min-h-6">
        <span className="text-sm font-semibold tracking-tight text-foreground break-all">
          {value}
        </span>
        {canCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background border border-transparent hover:border-border transition-all"
            title="Copia negli appunti"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}