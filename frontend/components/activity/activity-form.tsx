// components/activity/activity-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Activity, ActivityFormData } from "@/types/activitiy";
import { createActivity, updateActivity } from "@/actions/activity";
import { ActivityFormBasicInfo } from "./form/activity-form-basic-info";
import { ActivityFormScheduling } from "./form/activity-form-scheduling";
import { ActivityFormOutcome } from "./form/activity-form-outcome";
import { ActivityFormSettings } from "./form/activity-form-settings";
import { ActivityFormHeader } from "./form/activity-form-header";
import { ActivityStatusBadge } from "./activity-status-badge";
import { useActivityForm } from "@/hooks/use-activity-form";

interface ActivityFormProps {
  activity?: Activity;
  preselectedCustomerId?: string;
  preselectedContactId?: string;
  isEditMode?: boolean;
}

export function ActivityForm({
  activity,
  preselectedCustomerId,
  preselectedContactId,
  isEditMode = false,
}: ActivityFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("basic");

  const {
    formData,
    customers,
    contacts,
    handleChange,
    handleCustomerChange,
    searchCustomers,
  } = useActivityForm({
    activity,
    preselectedCustomerId,
    preselectedContactId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const payload = {
          customerId: parseInt(formData.customerId),
          contactId: formData.contactId ? parseInt(formData.contactId) : undefined,
          type: formData.type,
          subject: formData.subject,
          description: formData.description || undefined,
          status: formData.status,
          priority: formData.priority,
          scheduledStart: new Date(formData.scheduledStart).toISOString(),
          scheduledEnd: formData.scheduledEnd
            ? new Date(formData.scheduledEnd).toISOString()
            : undefined,
          duration: formData.duration ? parseInt(formData.duration) : undefined,
          reminderMinutes: formData.reminderMinutes
            ? parseInt(formData.reminderMinutes)
            : undefined,
          location: formData.location || undefined,
          outcome: formData.outcome || undefined,
          result: formData.result || undefined,
          internalNotes: formData.internalNotes || undefined,
          requiresFollowUp: formData.requiresFollowUp,
          followUpDate: formData.followUpDate || undefined,
        } as Partial<Activity>;

        let result;
        if (isEditMode && activity) {
          result = await updateActivity(activity.id, payload);
        } else {
          result = await createActivity(payload);
        }

        if (result.success) {
          toast.success(
            isEditMode
              ? "Attività aggiornata con successo"
              : "Attività creata con successo"
          );
          router.push(
            isEditMode ? `/activities/${activity!.id}` : "/activities"
          );
        } else {
          toast.error(result.error || "Errore durante il salvataggio");
        }
      } catch (error: any) {
        toast.error("Errore durante il salvataggio");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ActivityFormHeader
        isEditMode={isEditMode}
        isPending={isPending}
        onCancel={() => router.back()}
      />

      <ActivityStatusBadge
        status={formData.status}
        priority={formData.priority}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Info Base</TabsTrigger>
          <TabsTrigger value="schedule">Pianificazione</TabsTrigger>
          <TabsTrigger value="outcome">Esito</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <ActivityFormBasicInfo
            formData={formData}
            customers={customers}
            contacts={contacts}
            onChange={handleChange}
            onCustomerChange={handleCustomerChange}
            onSearchCustomers={searchCustomers}
          />
        </TabsContent>

        <TabsContent value="schedule">
          <ActivityFormScheduling formData={formData} onChange={handleChange} />
        </TabsContent>

        <TabsContent value="outcome">
          <ActivityFormOutcome formData={formData} onChange={handleChange} />
        </TabsContent>

        <TabsContent value="settings">
          <ActivityFormSettings formData={formData} onChange={handleChange} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button type="submit" disabled={isPending || !formData.customerId}>
          <Save className="mr-2 h-4 w-4" />
          {isPending
            ? "Salvataggio..."
            : isEditMode
            ? "Aggiorna"
            : "Crea Attività"}
        </Button>
      </div>
    </form>
  );
}
