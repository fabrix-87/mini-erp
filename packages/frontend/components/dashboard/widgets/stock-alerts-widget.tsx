// packages/frontend/components/dashboard/widgets/stock-alerts-widget.tsx
import { Package, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WidgetWrapper } from "../widget-wrapper";
import type { StockAlertItem } from "@mini-erp/shared";

interface Props {
  data?: StockAlertItem[];
  isLoading: boolean;
  isEditMode: boolean;
}

/** Stock alerts list: OUT_OF_STOCK and LOW_STOCK variants. */
export function StockAlertsWidget({ data, isLoading, isEditMode }: Props) {
  return (
    <WidgetWrapper
      title="Scorte in Esaurimento"
      isLoading={isLoading}
      isEditMode={isEditMode}
      skeletonRows={5}
      headerExtra={data?.length ? <Badge variant="destructive">{data.length}</Badge> : null}
    >
      {!data?.length ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Nessun articolo in esaurimento
        </p>
      ) : (
        <ul className="space-y-2 overflow-y-auto max-h-55 pr-1">
          {data.map((item) => (
            <li key={item.variantId} className="flex items-center gap-2 text-sm">
              {item.alertType === "OUT_OF_STOCK" ? (
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              ) : (
                <Package className="h-4 w-4 text-yellow-500 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.variantCode}</p>
                <p className="text-xs text-muted-foreground truncate">{item.productName}</p>
              </div>
              <span
                className={`text-xs font-semibold tabular-nums shrink-0 ${
                  item.alertType === "OUT_OF_STOCK" ? "text-red-500" : "text-yellow-600"
                }`}
              >
                {item.currentStock}
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetWrapper>
  );
}
