// app/leads/[id]/page.tsx
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Activity,
  Briefcase,
  Target,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { LeadStatusBadge } from "@/components/lead/lead-status-badge";
import { LeadQualityBadge } from "@/components/lead/lead-quality-badge";
import { LeadSourceBadge } from "@/components/lead/lead-source-badge";
import { LeadScoreDisplay } from "@/components/lead/lead-score-display";
import { getLeadByIdServer } from "@/services/server/lead";
import { LeadDetailActions } from "../components/lead-detail-actions";
import { LeadActivityList } from "@/components/lead/lead-activity-list";
import { daysSince, formatDateIT } from "@/helpers/date-helper";

// ============================================================================
// Page — Server Component
// ============================================================================

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Lead detail page — Server Component.
 * Fetches lead data server-side; delegates interactive actions to LeadDetailActions.
 */
export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) notFound();

  const response = await getLeadByIdServer(numId).catch(() => null);
  if (!response?.data) notFound();

  const lead = response.data;

  return (
    <>
      <BreadcrumbSetter items={[{ label: "Lead", href: "/leads" }, { label: lead.companyName }]} />

      <div className="space-y-6">
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                              */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/leads">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold tracking-tight">{lead.companyName}</h1>
                <LeadStatusBadge status={lead.status} size="md" />
                <LeadQualityBadge quality={lead.quality} />
              </div>
              <p className="text-sm text-muted-foreground">
                {lead.code} · Lead dal {formatDateIT(lead.createdAt)} · {daysSince(lead.createdAt)}{" "}
                giorni nel pipeline
              </p>
            </div>
          </div>

          {/* Action buttons — client island */}
          <LeadDetailActions lead={lead} />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Score hero card                                                     */}
        {/* ------------------------------------------------------------------ */}
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lead Score</p>
              <LeadScoreDisplay score={lead.score} size="lg" showBar />
              <p className="text-xs text-muted-foreground mt-1">su 100</p>
            </div>
            <div className="text-right space-y-1 text-sm text-muted-foreground">
              {lead.assignedUser && (
                <p>
                  Assegnato a{" "}
                  <span className="font-medium text-foreground">
                    {lead.assignedUser.details?.firstName} {lead.assignedUser.details?.lastName}
                  </span>
                </p>
              )}
              {lead.lastContactDate && (
                <p>
                  Ultimo contatto{" "}
                  <span className="font-medium text-foreground">
                    {formatDateIT(lead.lastContactDate)}
                  </span>
                </p>
              )}
              {lead.activities && (
                <p>
                  Prossimo follow-up{" "}
                  <span className="font-medium text-foreground">
                    {formatDateIT(lead.activities[0]?.scheduledStart)}
                  </span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* Tabs                                                                */}
        {/* ------------------------------------------------------------------ */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="contact">Contatto</TabsTrigger>
            <TabsTrigger value="commercial">Commerciale</TabsTrigger>
            <TabsTrigger value="bant">BANT</TabsTrigger>
            <TabsTrigger value="gdpr">GDPR</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="activities">Attività ({lead.activities?.length ?? 0})</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Azienda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Row label="Ragione sociale" value={lead.companyName} />
                  {lead.tradeName && <Row label="Nome commerciale" value={lead.tradeName} />}
                  {lead.vatNumber && <Row label="P.IVA" value={lead.vatNumber} />}
                  {lead.taxCode && <Row label="Codice fiscale" value={lead.taxCode} />}
                  {lead.website && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Website</span>
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="h-3 w-3" />
                        {lead.website}
                      </a>
                    </div>
                  )}
                  <Separator />
                  <Row label="Fonte" value={<LeadSourceBadge source={lead.source} />} />
                  <Row label="Status" value={<LeadStatusBadge status={lead.status} />} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indirizzo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {lead.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span>
                        {lead.address}
                        {lead.city && `, ${lead.city}`}
                        {lead.provinceCode && ` (${lead.provinceCode})`}
                        {lead.zipCode && ` — ${lead.zipCode}`}
                      </span>
                    </div>
                  )}
                  <Row label="Paese" value={lead.countryCode} />
                  <Separator />
                  <Row label="Creato il" value={formatDateIT(lead.createdAt)} />
                  <Row label="Aggiornato" value={formatDateIT(lead.updatedAt)} />
                </CardContent>
              </Card>
            </div>

            {lead.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Contatto principale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Nome" value={`${lead.contactFirstName} ${lead.contactLastName}`} />
                {lead.contactPosition && <Row label="Posizione" value={lead.contactPosition} />}
                {lead.contactDepartment && (
                  <Row label="Dipartimento" value={lead.contactDepartment} />
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <a
                    href={`mailto:${lead.contactEmail}`}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    {lead.contactEmail}
                  </a>
                </div>
                {lead.contactPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefono</span>
                    <a
                      href={`tel:${lead.contactPhone}`}
                      className="flex items-center gap-1 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {lead.contactPhone}
                    </a>
                  </div>
                )}
                {lead.contactMobile && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mobile</span>
                    <a
                      href={`tel:${lead.contactMobile}`}
                      className="flex items-center gap-1 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {lead.contactMobile}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commercial */}
          <TabsContent value="commercial" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Dati Commerciali
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {lead.estimatedValue && (
                  <Row
                    label="Valore stimato"
                    value={`€ ${Number(lead.estimatedValue).toLocaleString("it-IT")}`}
                  />
                )}
                {lead.budget && (
                  <Row label="Budget" value={`€ ${Number(lead.budget).toLocaleString("it-IT")}`} />
                )}
                {lead.annualRevenue && (
                  <Row
                    label="Fatturato annuo"
                    value={`€ ${Number(lead.annualRevenue).toLocaleString("it-IT")}`}
                  />
                )}
                {lead.estimatedSize && (
                  <Row label="Dimensione stimata" value={lead.estimatedSize} />
                )}
                {lead.industry && <Row label="Settore" value={lead.industry} />}
                {lead.employeesCount && (
                  <Row label="Dipendenti" value={String(lead.employeesCount)} />
                )}
                {lead.purchaseTimeframe && (
                  <Row label="Timeframe acquisto" value={lead.purchaseTimeframe} />
                )}
                {lead.decisionAuthority && (
                  <Row label="Autorità decisione" value={lead.decisionAuthority} />
                )}
                {lead.primaryNeed && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Necessità principale</p>
                      <p className="whitespace-pre-wrap">{lead.primaryNeed}</p>
                    </div>
                  </>
                )}
                {lead.interestedIn && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Interessato a</p>
                    <p className="whitespace-pre-wrap">{lead.interestedIn}</p>
                  </div>
                )}
                {lead.competitors && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Concorrenti</p>
                    <p className="whitespace-pre-wrap">{lead.competitors}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BANT */}
          <TabsContent value="bant" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Qualificazione BANT
                </CardTitle>
                <CardDescription>Budget · Authority · Need · Timeframe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Qualificato</span>
                  <Badge variant={lead.bantQualified ? "default" : "outline"}>
                    {lead.bantQualified ? "✓ Sì" : "No"}
                  </Badge>
                </div>
                {lead.bantNotes && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Note BANT</p>
                    <p className="whitespace-pre-wrap">{lead.bantNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* GDPR */}
          <TabsContent value="gdpr" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Consensi GDPR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ConsentRow
                  label="Privacy"
                  value={lead.privacyConsent}
                  date={lead.privacyConsentDate}
                />
                <ConsentRow
                  label="Marketing"
                  value={lead.marketingConsent}
                  date={lead.marketingConsentDate}
                />
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Non chiamare</span>
                  <Badge variant={lead.doNotCall ? "destructive" : "outline"}>
                    {lead.doNotCall ? "Sì" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Non inviare email</span>
                  <Badge variant={lead.doNotEmail ? "destructive" : "outline"}>
                    {lead.doNotEmail ? "Sì" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking */}
          <TabsContent value="tracking" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  Campaign Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {lead.campaignName && <Row label="Campagna" value={lead.campaignName} />}
                {lead.utmSource && <Row label="UTM Source" value={lead.utmSource} />}
                {lead.utmMedium && <Row label="UTM Medium" value={lead.utmMedium} />}
                {lead.utmCampaign && <Row label="UTM Campaign" value={lead.utmCampaign} />}
                {lead.landingPage && <Row label="Landing page" value={lead.landingPage} />}
                {lead.referrer && <Row label="Referrer" value={lead.referrer} />}
                <Separator />
                <Row label="Tentativi contatto" value={String(lead.contactAttempts)} />
                {lead.firstContactDate && (
                  <Row label="Primo contatto" value={formatDateIT(lead.firstContactDate)} />
                )}
                {lead.lastContactDate && (
                  <Row label="Ultimo contatto" value={formatDateIT(lead.lastContactDate)} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities */}
          <TabsContent value="activities" className="mt-4">
            <LeadActivityList leadId={lead.id} activities={lead.activities} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

/** Generic key-value row */
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/** GDPR consent row with date */
function ConsentRow({
  label,
  value,
  date,
}: {
  label: string;
  value: boolean;
  date: Date | string | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Badge variant={value ? "default" : "outline"}>
          {value ? "✓ Accordato" : "Non accordato"}
        </Badge>
        {value && date && (
          <span className="text-xs text-muted-foreground">{formatDateIT(date)}</span>
        )}
      </div>
    </div>
  );
}
