// components/activity/form/activity-form-scheduling.tsx
"use client";

import { Bell } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { ActivityFormData } from "@/types/activitiy";

interface ActivityFormSchedulingProps {
  formData: ActivityFormData;
  onChange: (field: keyof ActivityFormData, value: any) => void;
}

export function ActivityFormScheduling({
  formData,
  onChange,
}: ActivityFormSchedulingProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Data e Ora</CardTitle>
          <CardDescription>
            Pianifica quando eseguire l'attività
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduledStart">Inizio Programmato *</Label>
              <Input
                id="scheduledStart"
                type="datetime-local"
                value={formData.scheduledStart}
                onChange={(e) => onChange("scheduledStart", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledEnd">Fine Programmata</Label>
              <Input
                id="scheduledEnd"
                type="datetime-local"
                value={formData.scheduledEnd}
                onChange={(e) => onChange("scheduledEnd", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durata (minuti)</Label>
            <Select
              value={formData.duration}
              onValueChange={(value) => onChange("duration", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minuti</SelectItem>
                <SelectItem value="30">30 minuti</SelectItem>
                <SelectItem value="45">45 minuti</SelectItem>
                <SelectItem value="60">1 ora</SelectItem>
                <SelectItem value="90">1.5 ore</SelectItem>
                <SelectItem value="120">2 ore</SelectItem>
                <SelectItem value="180">3 ore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Stato</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => onChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Programmata</SelectItem>
                <SelectItem value="IN_PROGRESS">In Corso</SelectItem>
                <SelectItem value="COMPLETED">Completata</SelectItem>
                <SelectItem value="CANCELLED">Annullata</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Bell className="inline h-4 w-4 mr-2" />
            Promemoria
          </CardTitle>
          <CardDescription>Minuti prima per il promemoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="reminderMinutes">
              Promemoria (minuti prima)
            </Label>
            <Select
              value={formData.reminderMinutes}
              onValueChange={(value) => onChange("reminderMinutes", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nessun promemoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nessuno</SelectItem>
                <SelectItem value="15">15 minuti prima</SelectItem>
                <SelectItem value="30">30 minuti prima</SelectItem>
                <SelectItem value="60">1 ora prima</SelectItem>
                <SelectItem value="120">2 ore prima</SelectItem>
                <SelectItem value="1440">1 giorno prima</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
