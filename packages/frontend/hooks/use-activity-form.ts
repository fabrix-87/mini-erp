// components/activity/hooks/use-activity-form.ts
"use client";

import { useState, useEffect } from "react";
import { Activity, ActivityFormData } from "@/types/activitiy";
import { useCustomer } from "@/hooks/use-company";
import { useContactsByCompany } from "@/hooks/use-contact";
import { Customer, CustomerQueryParams } from "@/types/customer";
import { Contact } from "@/types/contact";
import { getCustomers } from "@/services/client/company";

interface UseActivityFormProps {
  activity?: Activity;
  preselectedCustomerId?: string;
  preselectedContactId?: string;
  preselectedDate?: string;
}

export function useActivityForm({
  activity,
  preselectedCustomerId,
  preselectedContactId,
  preselectedDate,
}: UseActivityFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    number | undefined
  >(
    activity?.customerId ||
      (preselectedCustomerId ? parseInt(preselectedCustomerId) : undefined)
  );

  // Carica il customer selezionato
  const { data: customerData } = useCustomer(selectedCustomerId, !!selectedCustomerId);

  // Carica i contatti della company del customer selezionato
  const companyId = customerData?.data?.companyId ?? 0;
  
  const { contacts: companyContacts } = useContactsByCompany(companyId);


  const [formData, setFormData] = useState<ActivityFormData>(() => {
    if (activity) {
      const scheduledStart = new Date(activity.scheduledStart);
      const scheduledEnd = activity.scheduledEnd
        ? new Date(activity.scheduledEnd)
        : null;

      return {
        customerId: activity.customerId?.toString() || "",
        contactId: activity.contactId?.toString() || "",
        type: activity.type,
        subject: activity.subject,
        description: activity.description || "",
        status: activity.status,
        priority: activity.priority,
        scheduledStart: scheduledStart.toISOString().slice(0, 16),
        scheduledEnd: scheduledEnd?.toISOString().slice(0, 16) || "",
        duration: activity.duration?.toString() || "30",
        reminderMinutes: activity.reminderMinutes?.toString() || "",
        location: activity.location || "",
        outcome: activity.outcome || "",
        result: activity.result || "",
        internalNotes: activity.internalNotes || "",
        requiresFollowUp: activity.requiresFollowUp,
        followUpDate: activity.followUpDate || "",
        customFields: activity.customFields || {},
      };
    }

    const newDate = preselectedDate ? new Date(preselectedDate) : new Date()

    return {
      customerId: preselectedCustomerId || "",
      contactId: preselectedContactId || "",
      type: "CALL",
      subject: "",
      description: "",
      status: "SCHEDULED",
      priority: "MEDIUM",
      scheduledStart: newDate.toISOString().slice(0, 16),
      scheduledEnd: "",
      duration: "30",
      reminderMinutes: "",
      location: "",
      outcome: "",
      result: "",
      internalNotes: "",
      requiresFollowUp: false,
      followUpDate: "",
      customFields: {},
    };
  });

  // Inizializza la lista customers con quello selezionato
  useEffect(() => {
    if (customerData?.data) {
      setCustomers([customerData.data]);
    }
  }, [customerData]);

  const searchCustomersHandler = async (query: string) => {
    if (query.length < 2) return;
    try {
      const params = {
        search: query,
        limit: 10
      } as CustomerQueryParams
      const response = await getCustomers(params);
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error searching customers:", error);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData((prev) => ({
      ...prev,
      customerId,
      contactId: "", // Reset contact quando cambia customer
    }));
    setSelectedCustomerId(customerId ? parseInt(customerId) : undefined);
  };

  const handleChange = (field: keyof ActivityFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    customers,
    contacts: companyContacts || [],
    handleChange,
    handleCustomerChange,
    searchCustomers: searchCustomersHandler,
  };
}
