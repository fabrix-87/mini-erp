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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityFormData } from "@/types/activitiy";
import { Customer } from "@/types/customer";
import { Contact } from "@/types/contact";

const activityTypeLabels: Record<string, string> = {
  CALL: "Chiamata",
  EMAIL: "Email",
  MEETING: "Riunione",
  TASK: "Task",
  NOTE: "Nota",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
  VIDEO_CALL: "Videochiamata",
  SITE_VISIT: "Visita in loco",
  OTHER: "Altro",
};

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
  contacts: Contact[];
  onChange: (field: keyof ActivityFormData, value: any) => void;
  onCustomerChange: (customerId: string) => void;
  onSearchCustomers: (query: string) => void;
}

export function ActivityFormBasicInfo({
  formData,
  customers,
  contacts,
  onChange,
  onCustomerChange,
  onSearchCustomers,
}: ActivityFormBasicInfoProps) {
  const showLocationField = ["MEETING", "SITE_VISIT", "VIDEO_CALL"].includes(
    formData.type
  );

  const selectedCustomer = customers.find(
    (c) => c.id.toString() === formData.customerId
  );

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
            <Select
              value={formData.type}
              onValueChange={(value) => onChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(activityTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
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

        {/* Customer Selection con info CRM */}
        <div className="space-y-2">
          <Label htmlFor="customerId">Cliente *</Label>
          <Select value={formData.customerId} onValueChange={onCustomerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona cliente..." />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{customer.company?.companyName}</span>
                    <Badge
                      variant="outline"
                      className={leadStatusColors[customer.leadStatus]}
                    >
                      {customer.leadStatus}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Cerca cliente..."
            onChange={(e) => onSearchCustomers(e.target.value)}
            className="mt-2"
          />

          {/* Info Cliente Selezionato */}
          {selectedCustomer && (
            <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedCustomer.company?.companyName}
                </span>
                <Badge className={leadStatusColors[selectedCustomer.leadStatus]}>
                  {selectedCustomer.leadStatus}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>Codice: {selectedCustomer.company?.code}</div>
                {selectedCustomer.company?.vatNumber && (
                  <div>P.IVA: {selectedCustomer.company.vatNumber}</div>
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

        {/* Contact Selection */}
        <div className="space-y-2">
          <Label htmlFor="contactId">Contatto</Label>
          <Select
            value={formData.contactId}
            onValueChange={(value) => onChange("contactId", value)}
            disabled={!formData.customerId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona contatto..." />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id.toString()}>
                  <div className="flex flex-col">
                    <span>
                      {contact.firstName} {contact.lastName}
                    </span>
                    {contact.position && (
                      <span className="text-xs text-muted-foreground">
                        {contact.position}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showLocationField && (
          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="inline h-4 w-4 mr-1" />
              Luogo
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="Es: Sede cliente, Ufficio Milano, Online (Zoom)"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
