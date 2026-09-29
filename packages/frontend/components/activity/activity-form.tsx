// components/activity/activity-form.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Activity } from "@/types/activitiy-types";
import { ActivityFormBasicInfo } from "./form/activity-form-basic-info";
import { ActivityFormScheduling } from "./form/activity-form-scheduling";
import { ActivityFormOutcome } from "./form/activity-form-outcome";
import { ActivityFormSettings } from "./form/activity-form-settings";
import { ActivityStatusBadge } from "./activity-status-badge";
import { createActivityAction, updateActivityAction } from "@/actions/activity-actions";
import { useTranslations } from "next-intl";
import { useNavigation } from "@/hooks/use-navigation";
import { useForm } from "react-hook-form";
import { CreateActivityFormValues, createActivitySchema } from "@mini-erp/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormFooter } from "../form/form-footer";
import { Form } from "../ui/form";

interface ActivityFormProps {
  activity?: Activity;
  userId: string;
  preselectedCustomerId?: string;
  preselectedContactId?: string;
  preselectedLeadId?: string;
  preselectedDate?: string;
  isEditMode?: boolean;
}

export function ActivityForm({
  activity,
  userId,
  preselectedCustomerId,
  preselectedContactId,
  preselectedLeadId,
  preselectedDate,
  isEditMode = false,
}: ActivityFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const t = useTranslations("activities");
  const { navigateToDetail, navigate } = useNavigation();

  const scheduledStart = activity
    ? new Date(activity.scheduledStart)
    : preselectedDate
      ? new Date(preselectedDate)
      : new Date();
  const scheduledEnd = activity?.scheduledEnd ? new Date(activity.scheduledEnd) : null;

  const defaultValues = {
    customerId: activity?.customerId?.toString() ?? preselectedCustomerId ?? null,
    contactId: activity?.contactId?.toString() ?? preselectedContactId ?? null,
    leadId: activity?.leadId?.toString() ?? preselectedLeadId ?? null,
    type: activity?.type ?? "CALL",
    subject: activity?.subject ?? "",
    description: activity?.description ?? "",
    status: activity?.status ?? "SCHEDULED",
    priority: activity?.priority ?? "LOW",
    scheduledStart: scheduledStart.toISOString().slice(0, 16),
    scheduledEnd: scheduledEnd?.toISOString().slice(0, 16) ?? "",
    duration: activity?.duration ?? 30,
    reminderMinutes: activity?.reminderMinutes ?? null,
    location: activity?.location ?? "",
    outcome: activity?.outcome ?? null,
    result: activity?.result ?? "",
    internalNotes: activity?.internalNotes ?? "",
    customFields: activity?.customFields ?? {},
    assignedUserId: activity?.assignedUserId ?? userId,
    actualStart: activity?.actualStart ?? null,
    actualEnd: activity?.actualEnd ?? null,
  };

  const form = useForm<CreateActivityFormValues>({
    resolver: zodResolver(createActivitySchema),
    defaultValues,
  });

  const isPending = form.formState.isSubmitting;

  const onSubmit = async (data: CreateActivityFormValues) => {
    if (isEditMode && activity) {
      const { assignedUserId, ...cleanPayload } = data;
      const result = await updateActivityAction(activity.id, cleanPayload);
      if (result.success) {
        toast.success(t("updateSuccess"));
        navigateToDetail("activities", activity.id);
      } else {
        toast.error(result.error ?? t("updateError"));
      }
    } else {
      const result = await createActivityAction(data);
      if (result.success && result.data) {
        toast.success(t("createSuccess"));
        navigateToDetail("activities", result.data.id);
      } else {
        toast.error(result.error ?? t("createError"));
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ActivityStatusBadge />
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="crm-tabs-list">
            <TabsTrigger value="basic">{t("tabs.basic.label")}</TabsTrigger>
            <TabsTrigger value="schedule">{t("tabs.schedule.label")}</TabsTrigger>
            <TabsTrigger value="outcome">{t("tabs.outcome.label")}</TabsTrigger>
            <TabsTrigger value="settings">{t("tabs.settings.label")}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <ActivityFormBasicInfo />
          </TabsContent>
          <TabsContent value="schedule">
            <ActivityFormScheduling />
          </TabsContent>
          <TabsContent value="outcome">
            <ActivityFormOutcome />
          </TabsContent>
          <TabsContent value="settings">
            <ActivityFormSettings />
          </TabsContent>
        </Tabs>

        <FormFooter
          entityKey="activities"
          isEditMode={isEditMode}
          isPending={isPending}
          entityId={activity?.id}
        />
      </form>
    </Form>
  );
}
