// components/activity/form/activity-form-basic-info.tsx
"use client";

import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityFormData } from "@/types/activitiy-types";
import { Customer } from "@/types/customer-types";
import { Lead } from "@mini-erp/shared";
import { CustomerCombobox } from "@/components/combobox/customer-combobox";
import { LeadCombobox } from "@/components/combobox/lead-combobox";
import { ContactCombobox } from "@/components/combobox/contact-combobox";
import { getActivityTypeOptions } from "@/helpers/activity-helpers";
import { useTranslations } from "next-intl";
import { useState } from "react";

const leadStatusColors: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-700",
  CONTACTED: "bg-purple-500/10 text-purple-700",
  QUALIFIED: "bg-green-500/10 text-green-700",
  PROPOSAL: "bg-yellow-500/10 text-yellow-700",
  NEGOTIATION: "bg-orange-500/10 text-orange-700",
  CLOSED_WON: "bg-green-600/10 text-green-800",
  CLOSED_LOST: "bg-red-500/10 text-red-700",
};

interface ActivityFormBasicInfoProps {
  formData: ActivityFormData;
  customers: Customer[];
  leads: Lead[];
  onChange: (field: keyof ActivityFormData, value: any) => void;
  onCustomerChange: (customerId: string) => void;
  onLeadChange: (leadId: string) => void;
}

export function ActivityFormBasicInfo({
  formData,
  customers,
  leads,
  onChange,
  onCustomerChange,
  onLeadChange,
}: ActivityFormBasicInfoProps) {
  const t = useTranslations("activities");
  const showLocationField = ["MEETING", "SITE_VISIT", "VIDEO_CALL"].includes(formData.type);
  const selectedCustomer = customers.find((c) => c.id.toString() === formData.customerId);
  const selectedLead = leads.find((l) => l.id.toString() == formData.leadId);
  const [leadDisabled, setLeadDisabled] = useState(false);
  const [customerDisabled, setCustomerDisabled] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dettagli Attività</CardTitle>
        <CardDescription>Informazioni principali sull'attività</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo Attività *</Label>
            <Select value={formData.type} onValueChange={(value) => onChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getActivityTypeOptions(t).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priorità</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => onChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Bassa</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Oggetto *</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => onChange("subject", e.target.value)}
            required
            placeholder="Es: Chiamata follow-up preventivo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrizione</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Descrivi l'attività in dettaglio..."
            rows={5}
          />
        </div>

        {/* Customer o Lead Selection con Combobox */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerId">Cliente *</Label>
            <CustomerCombobox
              value={formData.customerId ?? undefined}
              disabled={customerDisabled}
              onValueChange={(value) => {
                onCustomerChange(value);
                if (value) {
                  setLeadDisabled(true);
                } else {
                  setLeadDisabled(false);
                }
              }}
            />

            {/* Info Cliente Selezionato */}
            {selectedCustomer && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedCustomer.company.companyName}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>Codice: {selectedCustomer.company.code}</div>
                  {selectedCustomer.company.vatNumber && (
                    <div>P.IVA: {selectedCustomer.company.vatNumber}</div>
                  )}
                  {selectedCustomer.company.mainEmail && (
                    <div>Email: {selectedCustomer.company.mainEmail}</div>
                  )}
                  {selectedCustomer.company.mainPhone && (
                    <div>Tel: {selectedCustomer.company.mainPhone}</div>
                  )}
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {selectedCustomer.segment}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {selectedCustomer.type}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadId">Lead *</Label>
            <LeadCombobox
              value={formData.leadId ?? undefined}
              disabled={leadDisabled}
              onValueChange={(value) => {
                onLeadChange(value);
                if(value){
                  setCustomerDisabled(true);
                }else{
                  setCustomerDisabled(false);
                }
              }}
            />

            {/* Info Lead Selezionato */}
            {selectedLead && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    ({selectedLead.code}) • {selectedLead.companyName}
                  </span>
                  <Badge className={leadStatusColors[selectedLead.status]}>
                    {selectedLead.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>
                    {selectedLead.contactFirstName} {selectedLead.contactLastName} •{" "}
                    {selectedLead.contactEmail}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Selection con Combobox */}
        <div className="space-y-2">
          <Label htmlFor="contactId">Contatto</Label>
          <ContactCombobox
            value={formData.contactId ?? undefined}
            onValueChange={(value) => onChange("contactId", value)}
            disabled={!formData.customerId}
          />
        </div>

        {showLocationField && (
          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="inline h-4 w-4 mr-1" />
              Luogo
            </Label>
            <Input
              id="location"
              value={formData.location ?? ""}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="Es: Sede cliente, Ufficio Milano, Online (Zoom)"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
