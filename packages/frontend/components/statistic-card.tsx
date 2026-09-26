// packages/frontend/components/ui/statistic-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatisticCardProps {
  /** Card title label */
  title: string;
  /** Main numeric value to display */
  value: number;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Tailwind color class applied to both icon and value, e.g. "text-green-600" */
  colorClass?: string;
  /** Optional secondary line below the value */
  description?: string;
}

/**
 * Reusable statistic card for dashboard summary panels.
 * Accepts a Lucide icon and an optional color class for theming.
 */
export function StatisticCard({
  title,
  value,
  icon: Icon,
  colorClass = 'text-foreground',
  description,
}: StatisticCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
