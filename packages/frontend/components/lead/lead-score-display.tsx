// components/leads/lead-score-display.tsx
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Returns Tailwind color classes based on score value (0-100).
 */
export function getScoreColorClass(score: number): string {
  if (score >= 80) return "text-red-600 dark:text-red-400";
  if (score >= 60) return "text-orange-500 dark:text-orange-400";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-sky-500 dark:text-sky-400";
}

/**
 * Returns progress bar color indicator class.
 */
function getProgressColorClass(score: number): string {
  if (score >= 80) return "[&>div]:bg-red-500";
  if (score >= 60) return "[&>div]:bg-orange-500";
  if (score >= 40) return "[&>div]:bg-yellow-500";
  return "[&>div]:bg-sky-500";
}

// ============================================================================
// Component
// ============================================================================

interface LeadScoreDisplayProps {
  score: number;
  /** Show progress bar below the number. @default false */
  showBar?: boolean;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Displays a numeric lead score (0-100) with optional progress bar.
 * Color-codes the value: red ≥ 80 (hot), orange ≥ 60, yellow ≥ 40, sky < 40.
 */
export function LeadScoreDisplay({
  score,
  showBar = false,
  size = "md",
  className,
}: LeadScoreDisplayProps) {
  const colorClass = getScoreColorClass(score);
  const sizeClass = {
    sm: "text-base font-semibold",
    md: "text-2xl font-bold",
    lg: "text-4xl font-bold",
  }[size];

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className={cn(sizeClass, colorClass)}>{score}</span>
      {showBar && (
        <Progress value={score} className={cn("h-1.5 w-16", getProgressColorClass(score))} />
      )}
    </div>
  );
}
