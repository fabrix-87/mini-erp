// packages/frontend/components/dashboard/widgets/alerts-widget.tsx
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { WidgetWrapper } from "../widget-wrapper";
import type { DashboardAlertItem } from "@mini-erp/shared";

interface Props {
  data?: DashboardAlertItem[];
  isLoading: boolean;
  isEditMode: boolean;
}

const SEVERITY_CONFIG = {
  HIGH: { icon: XCircle, className: "text-red-500" },
  MEDIUM: { icon: AlertTriangle, className: "text-yellow-500" },
  LOW: { icon: Info, className: "text-blue-500" },
} as const;

/** System alerts widget using HIGH/MEDIUM/LOW severity from backend. */
export function AlertsWidget({ data, isLoading, isEditMode }: Props) {
  return (
    <WidgetWrapper
      title="Avvisi di Sistema"
      isLoading={isLoading}
      isEditMode={isEditMode}
      skeletonRows={4}
      headerExtra={data?.length ? <Badge variant="secondary">{data.length}</Badge> : null}
    >
      {!data?.length ? (
        <p className="text-xs text-muted-foreground text-center py-6">Nessun avviso attivo</p>
      ) : (
        <ul className="space-y-2.5 overflow-y-auto max-h-55 pr-1">
          {data.map((alert) => {
            const { icon: Icon, className } =
              SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.LOW;
            return (
              <li key={alert.id} className="flex items-start gap-2 text-sm">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${className}`} />
                <div className="min-w-0">
                  <p className="text-sm leading-snug">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.createdAt), {
                      addSuffix: true,
                      locale: it,
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetWrapper>
  );
}
