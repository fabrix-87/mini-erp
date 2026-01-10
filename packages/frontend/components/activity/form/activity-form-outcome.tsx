// components/activity/form/activity-form-outcome.tsx
"use client";

import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

interface ActivityFormOutcomeProps {
  formData: ActivityFormData;
  onChange: (field: keyof ActivityFormData, value: any) => void;
}

export function ActivityFormOutcome({
  formData,
  onChange,
}: ActivityFormOutcomeProps) {
  const showOutcomeFields = formData.status === "COMPLETED";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Risultato Attività</CardTitle>
          <CardDescription>
            {showOutcomeFields
              ? "Registra l'esito dell'attività completata"
              : "Disponibile solo per attività completate"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showOutcomeFields ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="outcome">Esito</Label>
                <Select
                  value={formData.outcome || ""}
                  onValueChange={(value) => onChange("outcome", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona esito..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUCCESSFUL">Positivo</SelectItem>
                    <SelectItem value="NO_ANSWER">Nessuna risposta</SelectItem>
                    <SelectItem value="LEFT_MESSAGE">
                      Lasciato messaggio
                    </SelectItem>
                    <SelectItem value="FOLLOW_UP_NEEDED">
                      Richiede Follow-up
                    </SelectItem>
                    <SelectItem value="NOT_INTERESTED">
                      Non interessato
                    </SelectItem>
                    <SelectItem value="POSTPONED">Posticipato</SelectItem>
                    <SelectItem value="OTHER">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="result">Note sul Risultato</Label>
                <Textarea
                  id="result"
                  value={formData.result}
                  onChange={(e) => onChange("result", e.target.value)}
                  placeholder="Descrivi cosa è successo, le decisioni prese, i prossimi passi..."
                  rows={6}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Imposta lo stato su "Completata" per registrare l'esito</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Follow-up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="requiresFollowUp"
              checked={formData.requiresFollowUp}
              onCheckedChange={(checked) =>
                onChange("requiresFollowUp", checked)
              }
            />
            <Label htmlFor="requiresFollowUp">
              Richiede attività di follow-up
            </Label>
          </div>

          {formData.requiresFollowUp && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="followUpDate">Data Follow-up Suggerita</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => onChange("followUpDate", e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
