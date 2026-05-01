// packages/frontend/components/dashboard/widgets/overdue-installments-widget.tsx
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WidgetWrapper } from "../widget-wrapper";
import { isWidgetNotImplemented, type OverdueInstallmentItem } from "@mini-erp/shared";

interface Props {
  data?: OverdueInstallmentItem[] | { error: string };
  isLoading: boolean;
  isEditMode: boolean;
}

const fmt = (v: string) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(parseFloat(v));

/** Overdue installments list. Handles backend error shape gracefully. */
export function OverdueInstallmentsWidget({ data, isLoading, isEditMode }: Props) {
  // Backend può ritornare { error: "..." } se il servizio fallisce
  const hasError = !isLoading && data !== undefined && !Array.isArray(data) && "error" in data;

  const items = Array.isArray(data) ? data : [];

  return (
    <WidgetWrapper
      title="Rate Scadute"
      isLoading={isLoading}
      isEditMode={isEditMode}
      isError={hasError}
      skeletonRows={4}
      headerExtra={items.length > 0 ? <Badge variant="destructive">{items.length}</Badge> : null}
    >
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Nessuna rata scaduta</p>
      ) : (
        <ul className="space-y-2 overflow-y-auto max-h-55 pr-1">
          {items.map((item) => (
            <li
              key={`${item.documentId}-${item.installmentNumber}`}
              className="flex items-start justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.documentNumber ?? `#${item.documentId}`} · Rata {item.installmentNumber} ·{" "}
                  {format(new Date(item.dueDate), "dd MMM", { locale: it })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-red-500 tabular-nums">
                  {fmt(item.amount)}
                </p>
                <p className="text-xs text-muted-foreground">+{item.daysPastDue}gg</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetWrapper>
  );
}
