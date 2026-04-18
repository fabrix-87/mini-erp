// components/activity/activity-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Activity } from "@/types/activitiy";
import { createActivity, updateActivity } from "@/actions/activity";
import { ActivityFormBasicInfo } from "./form/activity-form-basic-info";
import { ActivityFormScheduling } from "./form/activity-form-scheduling";
import { ActivityFormOutcome } from "./form/activity-form-outcome";
import { ActivityFormSettings } from "./form/activity-form-settings";
import { ActivityFormHeader } from "./form/activity-form-header";
import { ActivityStatusBadge } from "./activity-status-badge";
import { useActivityForm } from "@/hooks/use-activity-form";
import { useAuth } from "@/hooks/use-auth";

interface ActivityFormProps {
  activity?: Activity;
  preselectedCustomerId?: string;
  preselectedContactId?: string;
  preselectedLeadId?: string;
  preselectedDate?: string;
  isEditMode?: boolean;
}

export function ActivityForm({
  activity,
  preselectedCustomerId,
  preselectedContactId,
  preselectedLeadId,
  preselectedDate,
  isEditMode = false,
}: ActivityFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("basic");
  const { user } = useAuth();

  const {
    formData,
    customers,
    contacts,
    leads,
    handleChange,
    handleCustomerChange,
    searchCustomers,
    searchLeads,
    handleLeadChange,
  } = useActivityForm({
    activity,
    preselectedCustomerId,
    preselectedContactId,
    preselectedLeadId,
    preselectedDate,
  });

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const payload = {
          customerId: formData.customerId ? Number(formData.customerId) : undefined,
          contactId: formData.contactId ? Number(formData.contactId) : undefined,
          leadId: formData.leadId ? Number(formData.leadId) : undefined,
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
          assignedUserId: user?.id || 0,
        } as Partial<Activity>;

        let result;
        if (isEditMode && activity) {
          const { assignedUserId, ...cleanPayload } = payload;
          result = await updateActivity(activity.id, cleanPayload);
        } else {
          result = await createActivity(payload);
        }

        if (result.success) {
          toast.success(
            isEditMode ? "Attività aggiornata con successo" : "Attività creata con successo",
          );
          router.push(isEditMode ? `/activities/${activity!.id}` : "/activities");
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

      <ActivityStatusBadge status={formData.status} priority={formData.priority} />

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
            leads={leads}
            onChange={handleChange}
            onCustomerChange={handleCustomerChange}
            onSearchCustomers={searchCustomers}
            onLeadChange={handleLeadChange}
            onSearchLeads={searchLeads}
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
        <Button type="submit" disabled={isPending || (!formData.customerId && !formData.leadId)}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Salvataggio..." : isEditMode ? "Aggiorna" : "Crea Attività"}
        </Button>
      </div>
    </form>
  );
}
