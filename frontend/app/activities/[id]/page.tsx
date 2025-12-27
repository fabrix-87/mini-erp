// app/(dashboard)/activities/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Users,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  Building2,
  User,
  Play,
  Pause,
  MoreVertical,
  Copy,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Activity } from "@/types/activitiy";
import {
  createFollowUp,
  deleteActivity,
  getActivity,
  setComplete,
} from "@/lib/client/modules/activity";

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

const statusColors: Record<string, string> = {
  planned: "bg-yellow-500/10 text-yellow-700 border-yellow-500/50",
  in_progress: "bg-blue-500/10 text-blue-700 border-blue-500/50",
  completed: "bg-green-500/10 text-green-700 border-green-500/50",
  cancelled: "bg-red-500/10 text-red-700 border-red-500/50",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-700",
  medium: "bg-blue-500/10 text-blue-700",
  high: "bg-orange-500/10 text-orange-700",
  urgent: "bg-red-500/10 text-red-700",
};

const outcomeColors: Record<string, string> = {
  successful: "bg-green-500/10 text-green-700",
  unsuccessful: "bg-red-500/10 text-red-700",
  follow_up_required: "bg-orange-500/10 text-orange-700",
  not_applicable: "bg-gray-500/10 text-gray-700",
};

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [outcomeNote, setOutcomeNote] = useState("");
  const [savingOutcome, setSavingOutcome] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, [id]);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const response = await getActivity(parseInt(id));
      setActivity(response.data);
      setOutcomeNote(response.data.outcomeNotes || "");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Errore nel caricamento");
      router.push("/dashboard/activities");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await setComplete(parseInt(id), outcomeNote);
      toast.success("Attività completata con successo");
      fetchActivity();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Errore durante il completamento"
      );
    }
  };

  const handleCreateFollowUp = async () => {
    try {
      const response = await createFollowUp(
        parseInt(id),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      );
      toast.success("Follow-up creato con successo");
      router.push(`/dashboard/activities/${response.data.id}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Errore durante la creazione"
      );
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare questa attività?")) return;

    try {
      await deleteActivity(parseInt(id));
      toast.success("Attività eliminata con successo");
      router.push("/dashboard/activities");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Errore durante l'eliminazione"
      );
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue =
    activity &&
    activity.status !== "completed" &&
    new Date(activity.scheduledDate) < new Date();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!activity) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{activity.subject}</h1>
              <Badge className={statusColors[activity.status]}>
                {activity.status}
              </Badge>
              <Badge className={priorityColors[activity.priority]}>
                {activity.priority}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  In ritardo
                </Badge>
              )}
              {activity.isPrivate && <Badge variant="outline">Privato</Badge>}
            </div>
            <p className="text-muted-foreground">
              {activityTypeLabels[activity.activityType]}
              {activity.direction &&
                ` • ${
                  activity.direction === "inbound" ? "In entrata" : "In uscita"
                }`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {activity.status === "planned" && (
            <Button onClick={handleComplete}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completa
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/activities/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {activity.status === "completed" && (
                <DropdownMenuItem onClick={handleCreateFollowUp}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Crea Follow-up
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copiato negli appunti");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copia Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Company & Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Azienda e Contatto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company */}
            {activity.Company && (
              <>
                <div
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() =>
                    router.push(`/dashboard/companies/${activity.companyId}`)
                  }
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {activity.Company.companyName}
                    </div>
                    {activity.Company.tradeName && (
                      <div className="text-sm text-muted-foreground">
                        {activity.Company.tradeName}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {activity.Company.code} • {activity.Company.type}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {activity.Company.primaryEmail && (
                        <a
                          href={`mailto:${activity.Company.primaryEmail}`}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="h-3 w-3" />
                          {activity.Company.primaryEmail}
                        </a>
                      )}
                      {activity.Company.primaryPhone && (
                        <a
                          href={`tel:${activity.Company.primaryPhone}`}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-3 w-3" />
                          {activity.Company.primaryPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* Contact */}
            {activity.Contact && (
              <>
                <Separator />
                <div
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() =>
                    router.push(`/contacts/${activity.Contact!.id}`)
                  }
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {activity.Contact.firstName} {activity.Contact.lastName}
                    </div>
                    {activity.Contact.jobTitle && (
                      <div className="text-sm text-muted-foreground">
                        {activity.Contact.jobTitle}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      {activity.Contact.email && (
                        <a
                          href={`mailto:${activity.Contact.email}`}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="h-3 w-3" />
                          {activity.Contact.email}
                        </a>
                      )}
                      {activity.Contact.phone && (
                        <a
                          href={`tel:${activity.Contact.phone}`}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-3 w-3" />
                          {activity.Contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Date & Time Info */}
        <Card>
          <CardHeader>
            <CardTitle>Pianificazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Data/Ora Programmata</span>
              </div>
              <div className="font-medium">
                {formatDateTime(activity.scheduledDate)}
              </div>
            </div>

            {activity.durationMinutes && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Durata</span>
                </div>
                <div className="font-medium">
                  {activity.durationMinutes} minuti
                </div>
              </div>
            )}

            {activity.location && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Luogo</span>
                </div>
                <div className="font-medium">{activity.location}</div>
              </div>
            )}

            {activity.reminderDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Promemoria</span>
                </div>
                <div className="font-medium">
                  {formatDateTime(activity.reminderDate)}
                </div>
              </div>
            )}

            {activity.completedDate && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Completata il</span>
                  </div>
                  <div className="font-medium text-green-600">
                    {formatDateTime(activity.completedDate)}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Creata il</span>
              <span>{formatDateTime(activity.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {activity.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrizione</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {activity.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Outcome Section */}
      {activity.status === "completed" && (
        <Card className="border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Esito Attività
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.outcome && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risultato</span>
                <Badge className={outcomeColors[activity.outcome]}>
                  {activity.outcome === "successful" && "Positivo"}
                  {activity.outcome === "unsuccessful" && "Negativo"}
                  {activity.outcome === "follow_up_required" &&
                    "Richiede Follow-up"}
                  {activity.outcome === "not_applicable" && "Non Applicabile"}
                </Badge>
              </div>
            )}

            {activity.outcomeNotes && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2">
                  Note sull'Esito
                </Label>
                <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                  {activity.outcomeNotes}
                </div>
              </div>
            )}

            {activity.requiresFollowUp && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-orange-700">
                      Follow-up Richiesto
                    </div>
                    {activity.followUpDate && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Data suggerita:{" "}
                        {new Date(activity.followUpDate).toLocaleDateString(
                          "it-IT"
                        )}
                      </div>
                    )}
                  </div>
                  {!activity.followUpActivity && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCreateFollowUp}
                    >
                      Crea Follow-up
                    </Button>
                  )}
                </div>
              </div>
            )}

            {activity.followUpActivity && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Follow-up Creato</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {activity.followUpActivity.subject}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/dashboard/activities/${activity.followUpActivity!.id}`
                      )
                    }
                  >
                    Visualizza
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Outcome Input for Planned Activities */}
      {activity.status === "planned" && (
        <Card>
          <CardHeader>
            <CardTitle>Completa Attività</CardTitle>
            <CardDescription>
              Registra l'esito dell'attività prima di completarla
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outcomeNote">Note sull'Esito</Label>
              <Textarea
                id="outcomeNote"
                value={outcomeNote}
                onChange={(e) => setOutcomeNote(e.target.value)}
                placeholder="Descrivi cosa è successo durante l'attività, le decisioni prese, i prossimi passi..."
                rows={5}
              />
            </div>
            <Button
              onClick={handleComplete}
              disabled={savingOutcome}
              className="w-full"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Segna come Completata
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Participants */}
      {activity.participants && activity.participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Partecipanti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activity.participants.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg border"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {participant.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {participant.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
