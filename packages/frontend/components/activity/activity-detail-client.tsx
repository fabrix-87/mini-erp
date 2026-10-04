// app/activities/[id]/activity-detail-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, FileText, Clock, Calendar, AlertCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity } from "@/types/activitiy-types";
import { BreadcrumbSetter } from "../ui/breadcrumb-setter";
import { formatDateIT } from "@/helpers/date-helper";
import Link from "next/link";
import { getDetailRoute } from "@/lib/navigation-routes";
import {
  ActivityPriorityColors,
  ActivityStatusColors,
  ActivityTypeIcons,
} from "@/constants/activity-priority-colors";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { ActionToolbar } from "../action-toolbar";
import { CompleteActivitySheet } from "@/app/(protected)/activities/components/complete-activity-sheet";
import { CompleteActivityFormValues } from "@mini-erp/shared";
import { completeActivityAction } from "@/actions/activity-actions";
import { toast } from "sonner";

interface ActivityDetailClientProps {
  activity: Activity;
}

export function ActivityDetailClient({ activity }: ActivityDetailClientProps) {
  const t = useTranslations("activities");
  const tc = useTranslations("common");
  const Icon = ActivityTypeIcons[activity.type] || FileText;
  const priorityColor = ActivityPriorityColors[activity.priority];
  const statusColor = ActivityStatusColors[activity.status];
  const isCompleted = activity.status === "COMPLETED";

  const completeActivitySubmit = async (data: CompleteActivityFormValues) => {
    const result = await completeActivityAction(activity.id, data);
    if (result.success && result.data) {
      toast.success(t("completeActivity.success"));
    } else {
      toast.error(result.error ?? t("completeActivity.error"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("form.type")}</p>
                <p className="text-lg font-semibold">{t(`type.${activity.type}`)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={cn(statusColor.text, statusColor.bg)}>
                {t(`status.${activity.status}`)}
              </Badge>
              <Badge
                variant="outline"
                className={cn(priorityColor.border, priorityColor.text, priorityColor.bg)}
              >
                {`${t("form.priority")}: ${t(`priority.${activity.priority}`)}`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isCompleted && (
        <ActionToolbar
          ariaLabelKey="activities.toolbar.ariaLabel"
          buttons={[
            {
              type: "sheet",
              mode: "custom",
              key: "complete-activity",
              labelKey: "activities.completeActivity.title",
              renderSheet: ({ open, onOpenChange }) => (
                <CompleteActivitySheet
                  onOpenChange={onOpenChange}
                  open={open}
                  onSubmit={completeActivitySubmit}
                />
              ),
            },
          ]}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informazioni Principali */}
        <Card>
          <CardHeader>
            <CardTitle>{tc("info")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("form.subject")}</p>
              <p className="text-base">{activity.subject}</p>
            </div>

            {activity.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("form.description")}</p>
                <p className="text-base">{activity.description}</p>
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">{tc("company")}</p>
              {activity.customer && (
                <p className="text-base">
                  <Link
                    href={getDetailRoute("customers", activity.customerId!)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    {activity.customer?.company?.companyName}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </p>
              )}
              {activity.supplier && (
                <p className="text-base">
                  <Link
                    href={getDetailRoute("suppliers", activity.supplierId!)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    {activity.supplier?.company?.companyName}{" "}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </p>
              )}
              {activity.lead && (
                <p className="text-base">
                  <Link
                    href={getDetailRoute("leads", activity.leadId!)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    {activity.lead.companyName} <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">{tc("contact")}</p>
              {activity.contact && (
                <p className="text-base">
                  👤 {activity.contact.firstName} {activity.contact.lastName}
                </p>
              )}
              {activity.lead && (
                <p className="text-base">
                  👤 {activity.lead.contactFirstName} {activity.lead?.contactLastName}
                </p>
              )}
              {activity.location && (
                <p className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {activity.location}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pianificazione */}
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.schedule.label")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("tabs.schedule.startDate")}
              </p>
              <p className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDateIT(activity.scheduledStart)}
              </p>
            </div>

            {activity.scheduledEnd && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tabs.schedule.endDate")}
                </p>
                <p className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateIT(activity.scheduledEnd)}
                </p>
              </div>
            )}

            {activity.duration && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("form.duration")}</p>
                <p className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t(`duration.${activity.duration}`)}
                </p>
              </div>
            )}

            {activity.reminderMinutes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("reminder.title")}</p>
                <p className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {t(`reminder.options.${activity.reminderMinutes}`)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Esito (se completata) */}
        {isCompleted && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("tabs.outcome.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity.outcome && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("tabs.outcome.label")}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {t(`outcome.${activity.outcome}`)}
                  </Badge>
                </div>
              )}

              {activity.result && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("form.result")}</p>
                  <p className="text-base mt-1">{activity.result}</p>
                </div>
              )}

              {activity.followUpActivity && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-700" />
                  <span className="text-sm font-medium text-yellow-700">
                    {t("followUpActivity")}
                  </span>
                  {activity.followUpActivity.scheduledStart && (
                    <span className="text-sm text-muted-foreground ml-auto">
                      <Link href={getDetailRoute("activities", activity.followUpActivity.id)}>
                        {activity.followUpActivity.subject} -{" "}
                        {formatDateIT(activity.followUpActivity.scheduledStart)}
                      </Link>
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Note Interne */}
        {activity.internalNotes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("tabs.settings.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base whitespace-pre-wrap">{activity.internalNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{tc("metadata.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground">{tc("metadata.createdAt")}</p>
              <p>{formatDateIT(activity.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{tc("metadata.updatedAt")}</p>
              <p>{formatDateIT(activity.updatedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{tc("metadata.id")}</p>
              <p>#{activity.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
