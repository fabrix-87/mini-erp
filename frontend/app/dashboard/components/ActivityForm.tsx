// app/dashboard/activities/[id]/edit/page.tsx o new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Activity as ActivityIcon,
  Calendar,
  MapPin,
  Bell,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { Company } from "@/types/company";
import { Contact } from "@/types/contact";
import { ActivityFormData } from "@/types/activitiy";
import {
  createActivity,
  createActivityPayload,
  getActivity,
  updateActivity,
} from "@/lib/client/modules/activity";
import { getCompany, searchCompanies } from "@/lib/client/modules/company";
import { getContactsByCompanyId } from "@/lib/api/modules/contact";

const activityTypeLabels: Record<string, string> = {
  call: "Chiamata",
  email: "Email",
  meeting: "Riunione",
  task: "Task",
  note: "Nota",
  visit: "Visita",
  demo: "Demo",
  proposal: "Proposta",
  quote: "Preventivo",
  other: "Altro",
};

export default function ActivityFormPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isEditMode = !!params?.id;
  const activityId = params?.id as string;
  const preselectedCompanyId = searchParams.get("companyId");
  const preselectedContactId = searchParams.get("contactId");

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [formData, setFormData] = useState<ActivityFormData>({
    companyId: preselectedCompanyId || "",
    contactId: preselectedContactId || "",
    activityType: "call",
    direction: "outbound",
    subject: "",
    description: "",
    status: "planned",
    priority: "medium",
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: new Date().toTimeString().slice(0, 5),
    completedDate: "",
    durationMinutes: "30",
    reminderDate: "",
    reminderTime: "",
    location: "",
    outcome: "",
    outcomeNotes: "",
    requiresFollowUp: false,
    followUpDate: "",
    isPrivate: false,
  });

  useEffect(() => {
    if (isEditMode) {
      fetchActivity();
    } else if (preselectedCompanyId) {
      loadCompanyContacts(preselectedCompanyId);
      loadCompany(parseInt(preselectedCompanyId));
    }
  }, [activityId, preselectedCompanyId]);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const response = await getActivity(parseInt(activityId));
      const activity = response.data;

      const scheduledDateTime = activity.scheduledDate
        ? new Date(activity.scheduledDate)
        : new Date();
      const completedDateTime = activity.completedDate
        ? new Date(activity.completedDate)
        : null;
      const reminderDateTime = activity.reminderDate
        ? new Date(activity.reminderDate)
        : null;
      const followUpDateTime = activity.followUpDate
        ? new Date(activity.followUpDate)
        : null;

      setFormData({
        companyId: activity.companyId?.toString() || "",
        contactId: activity.contactId?.toString() || "",
        activityType: activity.activityType || "call",
        direction: activity.direction || "outbound",
        subject: activity.subject || "",
        description: activity.description || "",
        status: activity.status || "planned",
        priority: activity.priority || "medium",
        scheduledDate: scheduledDateTime.toISOString().split("T")[0],
        scheduledTime: scheduledDateTime.toTimeString().slice(0, 5),
        completedDate: completedDateTime
          ? completedDateTime.toISOString().split("T")[0]
          : "",
        durationMinutes: activity.durationMinutes?.toString() || "30",
        reminderDate: reminderDateTime
          ? reminderDateTime.toISOString().split("T")[0]
          : "",
        reminderTime: reminderDateTime
          ? reminderDateTime.toTimeString().slice(0, 5)
          : "",
        location: activity.location || "",
        outcome: activity.outcome || "",
        outcomeNotes: activity.outcomeNotes || "",
        requiresFollowUp: activity.requiresFollowUp || false,
        followUpDate: followUpDateTime
          ? followUpDateTime.toISOString().split("T")[0]
          : "",
        isPrivate: activity.isPrivate || false,
      });

      if (activity.companyId) {
        loadCompanyContacts(activity.companyId.toString());
        loadCompany(activity.companyId)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Errore nel caricamento");
      router.push("/dashboard/activities");
    } finally {
      setLoading(false);
    }
  };

  const loadCompany = async (companyId: number) => {
    try {
      const response = await getCompany(companyId);
      setCompanies([response.data]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Errore nel caricamento");
    }
  };

  const searchFormCompanies = async (query: string) => {
    if (query.length < 2) return;
    try {
      const response = await searchCompanies(query, 10);
      setCompanies(response.data);
    } catch (error) {
      console.error("Error searching companies:", error);
    }
  };

  const loadCompanyContacts = async (companyId: string) => {
    try {
      const response = await getContactsByCompanyId(parseInt(companyId));
      setContacts(response.data);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    handleChange("companyId", companyId);
    handleChange("contactId", "");
    loadCompanyContacts(companyId);
  };

  const handleChange = (field: keyof ActivityFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = createActivityPayload(formData);

      if (isEditMode) {
        await updateActivity(parseInt(activityId), payload);
        toast.success("Attività aggiornata con successo");
        router.push(`/dashboard/activities/${activityId}`);
      } else {
        await createActivity(payload);
        toast.success("Attività creata con successo");
        router.push(`/dashboard/activities`);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Errore durante il salvataggio"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const showDirectionField = ["call", "email"].includes(formData.activityType);
  const showLocationField = ["meeting", "visit", "demo"].includes(
    formData.activityType
  );
  const showOutcomeFields = formData.status === "completed";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Modifica Attività" : "Nuova Attività"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Aggiorna i dettagli dell'attività"
                : "Registra una nuova attività o interazione"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annulla
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvataggio..." : "Salva"}
          </Button>
        </div>
      </div>

      {/* Quick Status Badge */}
      {formData.status && (
        <Card
          className={
            formData.status === "completed"
              ? "bg-green-500/5 border-green-500/20"
              : formData.status === "in_progress"
              ? "bg-blue-500/5 border-blue-500/20"
              : formData.status === "cancelled"
              ? "bg-red-500/5 border-red-500/20"
              : "bg-yellow-500/5 border-yellow-500/20"
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stato Attività</p>
                <p className="text-xl font-bold capitalize">
                  {formData.status.replace("_", " ")}
                </p>
              </div>
              <Badge
                variant={
                  formData.priority === "high" || formData.priority === "urgent"
                    ? "destructive"
                    : "secondary"
                }
                className="text-sm px-3 py-1"
              >
                Priorità: {formData.priority}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">
            <ActivityIcon className="mr-2 h-4 w-4" />
            Info Base
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" />
            Pianificazione
          </TabsTrigger>
          <TabsTrigger value="outcome">
            <FileText className="mr-2 h-4 w-4" />
            Esito
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Bell className="mr-2 h-4 w-4" />
            Impostazioni
          </TabsTrigger>
        </TabsList>

        {/* Info Base */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Attività</CardTitle>
              <CardDescription>
                Informazioni principali sull'attività
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activityType">Tipo Attività *</Label>
                  <Select
                    value={formData.activityType}
                    onValueChange={(value) =>
                      handleChange("activityType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(activityTypeLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {showDirectionField && (
                  <div className="space-y-2">
                    <Label htmlFor="direction">Direzione</Label>
                    <Select
                      value={formData.direction}
                      onValueChange={(value) =>
                        handleChange("direction", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbound">In Entrata</SelectItem>
                        <SelectItem value="outbound">In Uscita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Oggetto *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  required
                  placeholder="Es: Chiamata follow-up preventivo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Descrivi l'attività in dettaglio..."
                  rows={5}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyId">Azienda *</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={handleCompanyChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona azienda..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem
                          key={company.id}
                          value={company.id.toString()}
                        >
                          {company.companyName} ({company.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Cerca azienda..."
                    onChange={(e) => searchFormCompanies(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactId">Contatto</Label>
                  <Select
                    value={formData.contactId}
                    onValueChange={(value) => handleChange("contactId", value)}
                    disabled={!formData.companyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona contatto..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nobody">Nessuno (generale)</SelectItem>
                      {contacts.map((contact) => (
                        <SelectItem
                          key={contact.id}
                          value={contact.id.toString()}
                        >
                          {contact.firstName} {contact.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Es: Sede cliente, Ufficio Milano, Online (Zoom)"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pianificazione */}
        <TabsContent value="schedule" className="space-y-4">
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
                  <Label htmlFor="scheduledDate">Data Programmata *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      handleChange("scheduledDate", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Ora *</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      handleChange("scheduledTime", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Durata (minuti)</Label>
                <Select
                  value={formData.durationMinutes}
                  onValueChange={(value) =>
                    handleChange("durationMinutes", value)
                  }
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stato e Priorità</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Stato</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Pianificata</SelectItem>
                      <SelectItem value="in_progress">In Corso</SelectItem>
                      <SelectItem value="completed">Completata</SelectItem>
                      <SelectItem value="cancelled">Annullata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priorità</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bassa</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.status === "completed" && (
                <div className="space-y-2">
                  <Label htmlFor="completedDate">Data Completamento</Label>
                  <Input
                    id="completedDate"
                    type="date"
                    value={formData.completedDate}
                    onChange={(e) =>
                      handleChange("completedDate", e.target.value)
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Bell className="inline h-4 w-4 mr-2" />
                Promemoria
              </CardTitle>
              <CardDescription>
                Imposta un reminder per questa attività
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reminderDate">Data Reminder</Label>
                  <Input
                    id="reminderDate"
                    type="date"
                    value={formData.reminderDate}
                    onChange={(e) =>
                      handleChange("reminderDate", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Ora Reminder</Label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) =>
                      handleChange("reminderTime", e.target.value)
                    }
                    disabled={!formData.reminderDate}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Esito */}
        <TabsContent value="outcome" className="space-y-4">
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
                      value={formData.outcome}
                      onValueChange={(value) => handleChange("outcome", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona esito..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="successful">Positivo</SelectItem>
                        <SelectItem value="unsuccessful">Negativo</SelectItem>
                        <SelectItem value="follow_up_required">
                          Richiede Follow-up
                        </SelectItem>
                        <SelectItem value="not_applicable">
                          Non Applicabile
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outcomeNotes">Note sull'Esito</Label>
                    <Textarea
                      id="outcomeNotes"
                      value={formData.outcomeNotes}
                      onChange={(e) =>
                        handleChange("outcomeNotes", e.target.value)
                      }
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
                    handleChange("requiresFollowUp", checked)
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
                    onChange={(e) =>
                      handleChange("followUpDate", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Sarà creata automaticamente una nuova attività di follow-up
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impostazioni */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy e Visibilità</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Switch
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) =>
                    handleChange("isPrivate", checked)
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="isPrivate" className="text-sm font-medium">
                    Attività Privata
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Solo tu potrai vedere questa attività. Non sarà visibile ad
                    altri utenti del CRM.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button type="submit" disabled={saving || !formData.companyId}>
          <Save className="mr-2 h-4 w-4" />
          {saving
            ? "Salvataggio..."
            : isEditMode
            ? "Aggiorna"
            : "Crea Attività"}
        </Button>
      </div>
    </form>
  );
}
