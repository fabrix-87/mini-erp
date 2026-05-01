// packages/frontend/components/dashboard/widgets/activities-feed-widget.tsx
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WidgetWrapper } from "../widget-wrapper";
import type { ActivityFeedItem } from "@mini-erp/shared";

interface Props {
  data?: ActivityFeedItem[];
  isLoading: boolean;
  isEditMode: boolean;
}

/** Recent activities feed with overdue indicator. */
export function ActivitiesFeedWidget({ data, isLoading, isEditMode }: Props) {
  return (
    <WidgetWrapper
      title="Attività recenti"
      isLoading={isLoading}
      isEditMode={isEditMode}
      skeletonRows={5}
      headerExtra={data?.length ? <Badge variant="secondary">{data.length}</Badge> : null}
    >
      {!data?.length ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Nessuna attività nel periodo
        </p>
      ) : (
        <ul className="space-y-3 overflow-y-auto max-h-55 pr-1">
          {data.map((item, index) => (
            <li key={`${item.activityId ?? "unknown"}-${index}`} className="flex items-start gap-2">
              {item.isOverdue ? (
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {item.relatedEntity?.name ?? "—"} ·{" "}
                  {formatDistanceToNow(new Date(item.scheduledStart), {
                    addSuffix: true,
                    locale: it,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetWrapper>
  );
}
