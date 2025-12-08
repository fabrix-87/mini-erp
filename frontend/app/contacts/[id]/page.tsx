// app/(dashboard)/contacts/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Smartphone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Star,
  CheckCircle2,
  Globe,
  Activity,
  MessageSquare,  
  MoreVertical,  
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Contact } from "@/types/contact";
import {
  deleteContact,
  getContact,
  setPrimary,
} from "@/lib/api/modules/contact";
import { Activity as ContactActivity } from "@/types/activitiy";

const salutationLabels: Record<string, string> = {
  mr: "Sig.",
  ms: "Sig.ra",
  mrs: "Sig.ra",
  dr: "Dott.",
  prof: "Prof.",
};

const contactTypeLabels: Record<string, string> = {
  primary: "Principale",
  billing: "Amministrativo",
  technical: "Tecnico",
  decision_maker: "Decision Maker",
  influencer: "Influencer",
  other: "Altro",
};

const decisionLevelLabels: Record<string, string> = {
  executive: "Direttivo",
  manager: "Manager",
  employee: "Dipendente",
};

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const response = await getContact(parseInt(id));
      setContact(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Errore nel caricamento");
      router.push("/contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleSetAsPrimary = async () => {
    try {
      await setPrimary(parseInt(id));
      toast.success("Contatto impostato come principale");
      fetchContact();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Errore durante l'operazione"
      );
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler disattivare questo contatto?")) return;

    try {
      await deleteContact(parseInt(id));
      toast.success("Contatto disattivato con successo");
      router.push("/contacts");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Errore durante la disattivazione"
      );
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

  if (!contact) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold">
                {contact.firstName?.[0]}
                {contact.lastName?.[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {contact.salutation
                    ? salutationLabels[contact.salutation]
                    : ""}{" "}
                  {contact.firstName} {contact.lastName}
                </h1>
                {contact.isPrimary && (
                  <Badge className="bg-yellow-500/10 text-yellow-700">
                    <Star className="mr-1 h-3 w-3 fill-yellow-500" />
                    Principale
                  </Badge>
                )}
                {contact.isDecisionMaker && (
                  <Badge className="bg-orange-500/10 text-orange-700">
                    <Briefcase className="mr-1 h-3 w-3" />
                    Decision Maker
                  </Badge>
                )}
                <Badge variant={contact.active ? "default" : "secondary"}>
                  {contact.active ? "Attivo" : "Inattivo"}
                </Badge>
              </div>
              {contact.jobTitle && (
                <p className="text-lg text-muted-foreground">
                  {contact.jobTitle}
                </p>
              )}
              {contact.department && (
                <p className="text-sm text-muted-foreground">
                  {contact.department}
                </p>
              )}
              <div
                className="flex items-center gap-2 mt-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => router.push(`/dashboard/companies/${contact.companyId}`)}
              >
                <Building2 className="h-4 w-4" />
                <span className="hover:underline">
                  {contact.Company?.companyName}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!contact.isPrimary && (
            <Button variant="outline" onClick={handleSetAsPrimary}>
              <Star className="mr-2 h-4 w-4" />
              Imposta come Principale
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/contacts/${id}/edit`)}
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
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/activities/new?contactId=${id}`)}
              >
                <Activity className="mr-2 h-4 w-4" />
                Nuova Attività
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Invia Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Disattiva
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Contact Actions */}
      <div className="flex gap-2">
        {contact.email && (
          <Button variant="outline" asChild>
            <a href={`mailto:${contact.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </a>
          </Button>
        )}
        {contact.mobile && (
          <Button variant="outline" asChild>
            <a href={`tel:${contact.mobile}`}>
              <Smartphone className="mr-2 h-4 w-4" />
              Chiama Mobile
            </a>
          </Button>
        )}
        {contact.phone && (
          <Button variant="outline" asChild>
            <a href={`tel:${contact.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Chiama Fisso
            </a>
          </Button>
        )}
        {contact.whatsapp && (
          <Button variant="outline" asChild>
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="contact-info">Info Contatto</TabsTrigger>
          <TabsTrigger value="company-contacts">
            Altri Contatti ({contact.Company?.contacts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activities">
            Attività ({contact.Activities?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="privacy">Privacy & GDPR</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Informazioni Principali */}
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Principali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tipo Contatto
                  </span>
                  <Badge variant="secondary">
                    {contactTypeLabels[contact.contactType]}
                  </Badge>
                </div>
                {contact.decisionLevel && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Livello Decisionale
                    </span>
                    <span className="text-sm font-medium">
                      {decisionLevelLabels[contact.decisionLevel]}
                    </span>
                  </div>
                )}
                {contact.preferredContactMethod && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Metodo Preferito
                    </span>
                    <span className="text-sm font-medium capitalize">
                      {contact.preferredContactMethod.replace("_", " ")}
                    </span>
                  </div>
                )}
                {contact.preferredLanguage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Lingua Preferita
                    </span>
                    <span className="text-sm font-medium">
                      {contact.preferredLanguage}
                    </span>
                  </div>
                )}
                {contact.lastContactDate && (
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-sm text-muted-foreground">
                      Ultimo Contatto
                    </span>
                    <span className="text-sm font-medium">
                      {new Date(contact.lastContactDate).toLocaleDateString(
                        "it-IT"
                      )}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Creato il
                  </span>
                  <span className="text-sm">
                    {new Date(contact.createdAt).toLocaleDateString("it-IT")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recapiti */}
            <Card>
              <CardHeader>
                <CardTitle>Recapiti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">
                        Email Principale
                      </div>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm hover:underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}
                {contact.secondaryEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">
                        Email Secondaria
                      </div>
                      <a
                        href={`mailto:${contact.secondaryEmail}`}
                        className="text-sm hover:underline"
                      >
                        {contact.secondaryEmail}
                      </a>
                    </div>
                  </div>
                )}
                {contact.mobile && (
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">
                        Mobile
                      </div>
                      <a
                        href={`tel:${contact.mobile}`}
                        className="text-sm hover:underline"
                      >
                        {contact.mobile}
                      </a>
                    </div>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">
                        Telefono
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-sm hover:underline"
                      >
                        {contact.phone}
                        {contact.extension && ` (int. ${contact.extension})`}
                      </a>
                    </div>
                  </div>
                )}
                {contact.directLine && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">
                        Linea Diretta
                      </div>
                      <a
                        href={`tel:${contact.directLine}`}
                        className="text-sm hover:underline"
                      >
                        {contact.directLine}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Note */}
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact-info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Social & Messaging */}
            <Card>
              <CardHeader>
                <CardTitle>Social & Messaging</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.linkedinUrl && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
                {contact.skype && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Skype: {contact.skype}</span>
                  </div>
                )}
                {contact.whatsapp && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`https://wa.me/${contact.whatsapp.replace(
                        /\D/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      WhatsApp: {contact.whatsapp}
                    </a>
                  </div>
                )}
                {contact.telegram && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Telegram: {contact.telegram}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Indirizzo */}
            {contact.address && (
              <Card>
                <CardHeader>
                  <CardTitle>Indirizzo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {contact.address}
                      <br />
                      {contact.postalCode} {contact.city} ({contact.province})
                      <br />
                      {contact.country}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Date Importanti */}
            {contact.birthDate && (
              <Card>
                <CardHeader>
                  <CardTitle>Date Importanti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Compleanno
                      </div>
                      <div className="text-sm font-medium">
                        {new Date(contact.birthDate).toLocaleDateString(
                          "it-IT"
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Company Contacts Tab */}
        <TabsContent value="company-contacts">
          <Card>
            <CardHeader>
              <CardTitle>
                Altri Contatti in {contact.Company?.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!contact.Company?.contacts ||
              contact.Company?.contacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun altro contatto presente
                </div>
              ) : (
                <div className="space-y-3">
                  {contact.Company.contacts
                    .filter((c: any) => c.id !== contact.id)
                    .map((c: any) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/contacts/${c.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {c.firstName?.[0]}
                              {c.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {c.firstName} {c.lastName}
                              </span>
                              {c.isPrimary && (
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {c.jobTitle || "Nessun ruolo"}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Visualizza
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Attività con questo Contatto</CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/activities/new?contactId=${id}`)}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Nuova Attività
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!contact.Activities || contact.Activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessuna attività registrata
                </div>
              ) : (
                <div className="space-y-3">
                  {contact.Activities.map((activity: ContactActivity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{activity.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.scheduledDate).toLocaleDateString(
                            "it-IT"
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          activity.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Consensi GDPR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      contact.acceptsMarketing
                        ? "text-green-500"
                        : "text-gray-300"
                    }`}
                  />
                  <div>
                    <div className="font-medium">Marketing</div>
                    <div className="text-sm text-muted-foreground">
                      Accetta comunicazioni marketing
                    </div>
                  </div>
                </div>
                <Badge
                  variant={contact.acceptsMarketing ? "default" : "secondary"}
                >
                  {contact.acceptsMarketing ? "Sì" : "No"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      contact.acceptsNewsletter
                        ? "text-green-500"
                        : "text-gray-300"
                    }`}
                  />
                  <div>
                    <div className="font-medium">Newsletter</div>
                    <div className="text-sm text-muted-foreground">
                      Iscritto alla newsletter
                    </div>
                  </div>
                </div>
                <Badge
                  variant={contact.acceptsNewsletter ? "default" : "secondary"}
                >
                  {contact.acceptsNewsletter ? "Sì" : "No"}
                </Badge>
              </div>

              {contact.gdprConsentDate && (
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Consenso GDPR registrato il{" "}
                    {new Date(contact.gdprConsentDate).toLocaleDateString(
                      "it-IT"
                    )}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => router.push(`/contacts/${id}/edit#privacy`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifica Consensi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
