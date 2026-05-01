// app/activities/[id]/activity-detail-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  Users,
  Video,
  MapPin,
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Activity } from "@/types/activitiy";
import { deleteActivity } from "@/actions/activity";
import { BreadcrumbSetter } from "../ui/breadcrumb-setter";
import { formatDateIT } from "@/helpers/date-helper";
import Link from "next/link";

const activityTypeIcons: Record<string, any> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: FileText,
  NOTE: FileText,
  WHATSAPP: MessageSquare,
  SMS: Smartphone,
  VIDEO_CALL: Video,
  SITE_VISIT: MapPin,
  OTHER: FileText,
};

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-yellow-500/10 text-yellow-700",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700",
  COMPLETED: "bg-green-500/10 text-green-700",
  CANCELLED: "bg-red-500/10 text-red-700",
  RESCHEDULED: "bg-orange-500/10 text-orange-700",
  NO_SHOW: "bg-gray-500/10 text-gray-700",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Programmata",
  IN_PROGRESS: "In corso",
  COMPLETED: "Completata",
  CANCELLED: "Annullata",
  RESCHEDULED: "Riprogrammata",
  NO_SHOW: "Non presentato",
};

interface ActivityDetailClientProps {
  activity: Activity;
}

export function ActivityDetailClient({ activity }: ActivityDetailClientProps) {
  <BreadcrumbSetter
    items={[{ label: "Attività", href: "/activities" }, { label: activity.subject }]}
  />;

  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const Icon = activityTypeIcons[activity.type] || FileText;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteActivity(activity.id);
      toast.success("Attività eliminata con successo");
      router.push("/activities");
    } catch (error: any) {
      toast.error("Errore durante l'eliminazione");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/activities")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{activity.subject}</h1>
            <p className="text-muted-foreground">Dettagli dell'attività #{activity.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/activities/${activity.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler eliminare questa attività? L'operazione non può essere
                  annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600"
                >
                  {deleting ? "Eliminazione..." : "Elimina"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="text-lg font-semibold">{activity.type}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={statusColors[activity.status]}>
                {statusLabels[activity.status]}
              </Badge>
              <Badge variant="outline">Priorità: {activity.priority}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informazioni Principali */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Oggetto</p>
              <p className="text-base">{activity.subject}</p>
            </div>

            {activity.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descrizione</p>
                <p className="text-base">{activity.description}</p>
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Azienda</p>
              {activity.customer && (
                <p className="text-base">{activity.customer?.company?.companyName}</p>
              )}
              {activity.lead && (
                <p className="text-base">
                  <Link
                    href={`/leads/${activity.leadId}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    {activity.lead.companyName} <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </p>
              )}
            </div>

            {activity.contact && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contatto</p>
                <p className="text-base">
                  👤 {activity.contact.firstName} {activity.contact.lastName}
                </p>
              </div>
            )}

            {activity.lead && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contatto</p>
                <p className="text-base">
                  👤 {activity.lead.contactFirstName} {activity.lead?.contactLastName}
                </p>
              </div>
            )}

            {activity.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Luogo</p>
                <p className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {activity.location}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pianificazione */}
        <Card>
          <CardHeader>
            <CardTitle>Pianificazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data e Ora Inizio</p>
              <p className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDateIT(activity.scheduledStart)}
              </p>
            </div>

            {activity.scheduledEnd && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data e Ora Fine</p>
                <p className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateIT(activity.scheduledEnd)}
                </p>
              </div>
            )}

            {activity.duration && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Durata</p>
                <p className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {activity.duration} minuti
                </p>
              </div>
            )}

            {activity.reminderMinutes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promemoria</p>
                <p className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {activity.reminderMinutes} minuti prima
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Esito (se completata) */}
        {activity.status === "COMPLETED" && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Esito e Risultato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity.outcome && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Esito</p>
                  <Badge variant="outline" className="mt-1">
                    {activity.outcome}
                  </Badge>
                </div>
              )}

              {activity.result && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Note sul Risultato</p>
                  <p className="text-base mt-1">{activity.result}</p>
                </div>
              )}

              {activity.followUpActivity && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-700" />
                  <span className="text-sm font-medium text-yellow-700">Richiede Follow-up</span>
                  {activity.followUpActivity.scheduledStart && (
                    <span className="text-sm text-muted-foreground ml-auto">
                      {formatDateIT(activity.followUpActivity.scheduledStart)}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Note Interne */}
        {activity.internalNotes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Note Interne</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base whitespace-pre-wrap">{activity.internalNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground">Creata il</p>
              <p>{formatDateIT(activity.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ultimo aggiornamento</p>
              <p>{formatDateIT(activity.updatedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ID Attività</p>
              <p>#{activity.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
