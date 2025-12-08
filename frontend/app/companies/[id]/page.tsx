// app/(dashboard)/companies/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Briefcase,
  FileText,
  MoreVertical,
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
import { Company } from "@/types/company";
import { convertLeadToCustomer, deleteCompany, getCompany } from "@/lib/api/modules/company";

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as unknown as number;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const response = await getCompany(id, {
        include: "contacts,addresses,activities,opportunities",
      });
      setCompany(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Errore nel caricamento");
      router.push("/dashboard/companies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler disattivare questa azienda?")) return;

    try {
      await deleteCompany(id);
      toast.success("Azienda disattivata con successo");
      router.push("/dashboard/companies");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Errore durante la disattivazione"
      );
    }
  };

  const handleConvertToCustomer = async () => {
    if (!confirm("Convertire questo lead in cliente?")) return;

    try {
      await convertLeadToCustomer(id)
      toast.success("Lead convertito a cliente");
      fetchCompany();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Errore durante la conversione"
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

  if (!company) return null;

  const typeColors: Record<string, string> = {
    lead: "bg-blue-500/10 text-blue-700",
    prospect: "bg-purple-500/10 text-purple-700",
    customer: "bg-green-500/10 text-green-700",
    partner: "bg-orange-500/10 text-orange-700",
  };

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
              <h1 className="text-3xl font-bold">{company.companyName}</h1>
              <Badge className={typeColors[company.type]}>{company.type}</Badge>
              {company.leadStatus && (
                <Badge variant="outline">
                  {company.leadStatus.replace("_", " ")}
                </Badge>
              )}
            </div>
            {company.tradeName && (
              <p className="text-muted-foreground">{company.tradeName}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Codice: {company.code} • Creata il{" "}
              {new Date(company.createdAt).toLocaleDateString("it-IT")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {company.type === "lead" && (
            <Button variant="outline" onClick={handleConvertToCustomer}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Converti in Cliente
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/companies/${id}/edit`)}
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
                onClick={() => router.push(`/dashboard/activities/new?companyId=${id}`)}
              >
                <Activity className="mr-2 h-4 w-4" />
                Nuova Attività
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/opportunities/new?companyId=${id}`)
                }
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Nuova Opportunità
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

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordini Totali</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fatturato Totale
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{company.totalRevenue?.toLocaleString("it-IT") || "0"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {company.contacts?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Opportunità Aperte
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {company.opportunities?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="contacts">
            Contatti ({company.contacts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activities">
            Attività ({company.activities?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            Opportunità ({company.opportunities?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="commercial">Condizioni Commerciali</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Dati Aziendali */}
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Aziendali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Forma Giuridica
                    </div>
                    <div className="text-sm">{company.legalForm || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Settore
                    </div>
                    <div className="text-sm">{company.industry || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Dimensione
                    </div>
                    <div className="text-sm">{company.companySize || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Dipendenti
                    </div>
                    <div className="text-sm">
                      {company.employeesCount || "-"}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Dati Fiscali
                  </div>
                  {company.vatNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Partita IVA</span>
                      <span className="font-medium">{company.vatNumber}</span>
                    </div>
                  )}
                  {company.taxCode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Codice Fiscale
                      </span>
                      <span className="font-medium">{company.taxCode}</span>
                    </div>
                  )}
                  {company.sdiCode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Codice SDI</span>
                      <span className="font-medium">{company.sdiCode}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contatti */}
            <Card>
              <CardHeader>
                <CardTitle>Contatti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.primaryEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${company.primaryEmail}`}
                      className="text-sm hover:underline"
                    >
                      {company.primaryEmail}
                    </a>
                  </div>
                )}
                {company.primaryPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${company.primaryPhone}`}
                      className="text-sm hover:underline"
                    >
                      {company.primaryPhone}
                    </a>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.pecEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="text-muted-foreground mr-2">PEC:</span>
                      {company.pecEmail}
                    </div>
                  </div>
                )}

                {company.legalAddress && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium mb-1">Sede Legale</div>
                        <div className="text-muted-foreground">
                          {company.legalAddress}
                          <br />
                          {company.legalPostalCode} {company.legalCity} (
                          {company.legalProvince})<br />
                          {company.legalCountry}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lead Info (se lead) */}
          {company.type === "lead" && (
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {company.leadSource && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Origine
                      </div>
                      <div className="text-sm">{company.leadSource}</div>
                    </div>
                  )}
                  {company.leadStatus && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Status
                      </div>
                      <Badge variant="outline">
                        {company.leadStatus.replace("_", " ")}
                      </Badge>
                    </div>
                  )}
                  {company.leadScore !== undefined && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Score
                      </div>
                      <div className="text-sm font-bold">
                        {company.leadScore}/100
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contatti Azienda</CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/contacts/new?companyId=${id}`)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Aggiungi Contatto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!company.contacts || company.contacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun contatto presente
                </div>
              ) : (
                <div className="space-y-4">
                  {company.contacts.map((contact: any) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {contact.firstName?.[0]}
                            {contact.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                            {contact.isPrimary && (
                              <Badge variant="secondary" className="ml-2">
                                Principale
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contact.jobTitle || "Nessun ruolo"}
                          </div>
                          {contact.email && (
                            <div className="text-xs text-muted-foreground">
                              {contact.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Dettagli
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
                <CardTitle>Attività Recenti</CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/activities/new?companyId=${id}`)}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Nuova Attività
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!company.activities || company.activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessuna attività registrata
                </div>
              ) : (
                <div className="space-y-3">
                  {company.activities.map((activity: any) => (
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

        {/* Opportunities Tab */}
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Opportunità</CardTitle>
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/dashboard/opportunities/new?companyId=${id}`)
                  }
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Nuova Opportunità
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!company.opportunities || company.opportunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessuna opportunità presente
                </div>
              ) : (
                <div className="space-y-3">
                  {company.opportunities.map((opportunity: any) => (
                    <div
                      key={opportunity.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/opportunities/${opportunity.id}`)
                      }
                    >
                      <div>
                        <div className="font-medium">{opportunity.name}</div>
                        <div className="text-sm text-muted-foreground">
                          €{opportunity.estimatedValue?.toLocaleString("it-IT")}{" "}
                          • {opportunity.stage}
                        </div>
                      </div>
                      <Badge>{opportunity.probability}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commercial Tab */}
        <TabsContent value="commercial">
          <Card>
            <CardHeader>
              <CardTitle>Condizioni Commerciali</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Termini di Pagamento
                  </div>
                  <div className="text-lg font-semibold">
                    {company.paymentTermDays} giorni
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Fido Commerciale
                  </div>
                  <div className="text-lg font-semibold">
                    €{company.creditLimit?.toLocaleString("it-IT") || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Debito Corrente
                  </div>
                  <div className="text-lg font-semibold text-destructive">
                    €{company.currentDebt?.toLocaleString("it-IT") || "0"}
                  </div>
                </div>
                {company.customerSegment && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Segmento Cliente
                    </div>
                    <Badge className="text-base px-3 py-1">
                      {company.customerSegment}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
