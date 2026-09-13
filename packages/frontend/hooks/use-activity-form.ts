// components/activity/hooks/use-activity-form.ts
"use client";

import { useState, useEffect } from "react";
import { Activity, ActivityFormData } from "@/types/activitiy-types";
import { useCustomer } from "@/hooks/use-company";
import { useContactsByCompany } from "@/hooks/use-contact";
import { Customer, CustomerQueryInput } from "@/types/customer-types";
import { getCustomers } from "@/services/client/company";
import { Lead, LeadQueryInput } from "@mini-erp/shared";
import { getLeads } from "@/services/client/lead";
import { useLead } from "./use-lead";
import { useAuth } from "./use-auth";

interface UseActivityFormProps {
  activity?: Activity;
  preselectedCustomerId?: string;
  preselectedContactId?: string;
  preselectedLeadId?: string;
  preselectedDate?: string;
}

export function useActivityForm({
  activity,
  preselectedCustomerId,
  preselectedContactId,
  preselectedLeadId,
  preselectedDate,
}: UseActivityFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(
    activity?.customerId || (preselectedCustomerId ?? undefined),
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>(
    activity?.leadId || (preselectedLeadId ?? undefined),
  );
  const { user } = useAuth();

  // Carica il customer selezionato
  const { data: customerData } = useCustomer(selectedCustomerId, !!selectedCustomerId);
  const { data: leadData } = useLead(selectedLeadId, !!selectedLeadId);

  // Carica i contatti della company del customer selezionato
  const companyId = customerData?.data?.companyId ?? "";

  const { contacts: companyContacts } = useContactsByCompany(companyId);

  const [formData, setFormData] = useState<ActivityFormData>(() => {
    if (activity) {
      const scheduledStart = new Date(activity.scheduledStart);
      const scheduledEnd = activity.scheduledEnd ? new Date(activity.scheduledEnd) : null;

      return {
        customerId: activity.customerId?.toString() || "",
        contactId: activity.contactId?.toString() || "",
        leadId: activity.leadId?.toString() || "",
        type: activity.type,
        subject: activity.subject,
        description: activity.description || "",
        status: activity.status,
        priority: activity.priority,
        scheduledStart: scheduledStart.toISOString().slice(0, 16),
        scheduledEnd: scheduledEnd?.toISOString().slice(0, 16) || "",
        duration: activity.duration || 30,
        reminderMinutes: activity.reminderMinutes || undefined,
        location: activity.location || "",
        outcome: activity.outcome || undefined,
        result: activity.result || "",
        internalNotes: activity.internalNotes || "",
        customFields: activity.customFields || {},
        assignedUserId: activity.assignedUserId || user!.userId,
        actualStart: activity.actualStart || null,
        actualEnd: activity.actualEnd || null,
      };
    }

    const newDate = preselectedDate ? new Date(preselectedDate) : new Date();

    return {
      customerId: preselectedCustomerId || "",
      contactId: preselectedContactId || "",
      leadId: preselectedLeadId || "",
      type: "CALL",
      subject: "",
      description: "",
      status: "SCHEDULED",
      priority: "MEDIUM",
      scheduledStart: newDate.toISOString().slice(0, 16),
      scheduledEnd: "",
      duration: 30,
      reminderMinutes: undefined,
      location: "",
      outcome: undefined,
      result: "",
      internalNotes: "",
      customFields: {},
      assignedUserId: user!.userId,
      actualStart: null,
      actualEnd: null,
    };
  });

  // Inizializza la lista customers con quello selezionato
  useEffect(() => {
    if (customerData?.data) {
      setCustomers([customerData.data]);
    }
  }, [customerData]);

  // Inizializza la lista lead con quello selezionato
  useEffect(() => {
    if (leadData?.data) {
      setLeads([leadData.data]);
    }
  }, [leadData]);

  const searchCustomersHandler = async (query: string) => {
    if (query.length < 2) return;
    try {
      const params = {
        search: query,
        limit: 10,
      } as CustomerQueryInput;
      const response = await getCustomers(params);
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error searching customers:", error);
    }
  };

  const searchLeadsHandler = async (query: string) => {
    if (query.length < 2) return;
    try {
      const params = {
        search: query,
        limit: 10,
      } as LeadQueryInput;
      const response = await getLeads(params);
      setLeads(response.data || []);
    } catch (error) {
      console.error("Error searching leads:", error);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData((prev) => ({
      ...prev,
      customerId,
      contactId: "", // Reset contact quando cambia customer
      leadId: "", // Reset lead quando cambia customer
    }));
    setSelectedCustomerId(customerId);
  };

  const handleLeadChange = (leadId: string) => {
    setFormData((prev) => ({
      ...prev,
      leadId,
      contactId: "", // Reset contact quando cambia lead
      customerId: "", // Reset customer quando cambia lead
    }));
    setSelectedLeadId(leadId);
  };

  const handleChange = (field: keyof ActivityFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    customers,
    leads,
    contacts: companyContacts || [],
    handleChange,
    handleCustomerChange,
    handleLeadChange,
    searchCustomers: searchCustomersHandler,
    searchLeads: searchLeadsHandler,
  };
}
