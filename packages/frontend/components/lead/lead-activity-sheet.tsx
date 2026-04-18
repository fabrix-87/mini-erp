// components/lead/lead-activity-sheet.tsx
"use client";

import { useTransition, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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

import { createActivity } from "@/actions/activity";
import { useAuth } from "@/hooks/use-auth";
import { ActivityFormData } from "@/types/activitiy";
import type { Activity } from "@mini-erp/shared";

// ─── types ───────────────────────────────────────────────────────────────────

interface LeadActivitySheetProps {
  leadId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional callback invoked after a successful creation */
  onSuccess?: (activity: Activity) => void;
}

type SheetFormData = Pick<
  ActivityFormData,
  | "type"
  | "subject"
  | "description"
  | "priority"
  | "status"
  | "scheduledStart"
  | "scheduledEnd"
  | "duration"
>;

// ─── constants ───────────────────────────────────────────────────────────────

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
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

const DURATION_OPTIONS = [
  { value: "15", label: "15 minuti" },
  { value: "30", label: "30 minuti" },
  { value: "45", label: "45 minuti" },
  { value: "60", label: "1 ora" },
  { value: "90", label: "1.5 ore" },
  { value: "120", label: "2 ore" },
] as const;

/**
 * Returns a ISO-formatted datetime string suitable for <input type="datetime-local">
 */
function toDatetimeLocal(date: Date): string {
  return date.toISOString().slice(0, 16);
}

// ─── component ───────────────────────────────────────────────────────────────

/**
 * Side sheet for creating a new activity linked to a specific lead.
 * Uses a Server Action for mutation and revalidates the lead detail page on success.
 */
export function LeadActivitySheet({
  leadId,
  open,
  onOpenChange,
  onSuccess,
}: LeadActivitySheetProps) {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<SheetFormData>(() => ({
    type: "CALL",
    subject: "",
    description: "",
    priority: "MEDIUM",
    status: "SCHEDULED",
    scheduledStart: toDatetimeLocal(new Date()),
    scheduledEnd: "",
    duration: "30",
  }));

  /** Generic field change handler */
  function handleChange<K extends keyof SheetFormData>(
    field: K,
    value: SheetFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  /** Reset form to defaults */
  function resetForm() {
    setFormData({
      type: "CALL",
      subject: "",
      description: "",
      priority: "MEDIUM",
      status: "SCHEDULED",
      scheduledStart: toDatetimeLocal(new Date()),
      scheduledEnd: "",
      duration: "30",
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const payload: Partial<Activity> = {
        leadId,
        type: formData.type,
        subject: formData.subject,
        description: formData.description || undefined,
        priority: formData.priority,
        status: formData.status,
        scheduledStart: new Date(formData.scheduledStart).toISOString(),
        scheduledEnd: formData.scheduledEnd
          ? new Date(formData.scheduledEnd).toISOString()
          : undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        assignedUserId: user?.id ?? 0,
      };

      const result = await createActivity(payload);

      if (result.success && result.data) {
        toast.success("Attività creata con successo");
        onSuccess?.(result.data);
        handleOpenChange(false);
      } else {
        toast.error(result.error ?? "Errore durante il salvataggio");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuova Attività</SheetTitle>
          <SheetDescription>
            Crea un'attività collegata a questo lead.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Tipo + Priorità */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleChange("type", v as ActivityFormData["type"])}
              >
                <SelectTrigger id="sheet-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sheet-priority">Priorità</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => handleChange("priority", v as ActivityFormData["priority"])}
              >
                <SelectTrigger id="sheet-priority">
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

          {/* Oggetto */}
          <div className="space-y-2">
            <Label htmlFor="sheet-subject">Oggetto *</Label>
            <Input
              id="sheet-subject"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="Es: Follow-up preventivo"
              required
            />
          </div>

          {/* Descrizione */}
          <div className="space-y-2">
            <Label htmlFor="sheet-description">Descrizione</Label>
            <Textarea
              id="sheet-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Dettagli aggiuntivi..."
              rows={3}
            />
          </div>

          {/* Inizio + Fine */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-start">Inizio *</Label>
              <Input
                id="sheet-start"
                type="datetime-local"
                value={formData.scheduledStart}
                onChange={(e) => handleChange("scheduledStart", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sheet-end">Fine</Label>
              <Input
                id="sheet-end"
                type="datetime-local"
                value={formData.scheduledEnd}
                onChange={(e) => handleChange("scheduledEnd", e.target.value)}
              />
            </div>
          </div>

          {/* Durata */}
          <div className="space-y-2">
            <Label htmlFor="sheet-duration">Durata</Label>
            <Select
              value={formData.duration}
              onValueChange={(v) => handleChange("duration", v)}
            >
              <SelectTrigger id="sheet-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isPending || !formData.subject}>
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Salvataggio..." : "Crea Attività"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}