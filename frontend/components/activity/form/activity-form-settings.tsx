// components/activity/form/activity-form-settings.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActivityFormData } from "@/types/activitiy";

interface ActivityFormSettingsProps {
  formData: ActivityFormData;
  onChange: (field: keyof ActivityFormData, value: any) => void;
}

export function ActivityFormSettings({
  formData,
  onChange,
}: ActivityFormSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Note Interne</CardTitle>
        <CardDescription>
          Note private visibili solo internamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          id="internalNotes"
          value={formData.internalNotes}
          onChange={(e) => onChange("internalNotes", e.target.value)}
          placeholder="Note interne riservate..."
          rows={5}
        />
      </CardContent>
    </Card>
  );
}
