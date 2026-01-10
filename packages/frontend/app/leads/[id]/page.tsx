// app/(dashboard)/leads/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, Edit, TrendingUp, Users, Building2, Mail, Phone, Globe, 
  MapPin, Calendar, Target, Activity, Briefcase, FileText, MoreVertical,
  Star, ThermometerSun, Snowflake, Flame, CheckCircle2, XCircle,
  ArrowRight, MessageSquare, Video
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Company } from '@/types/company'
import { convertLeadToCustomer, getCompany } from '@/lib/client/modules/company'

const leadStatusLabels: Record<string, string> = {
  new: 'Nuovo',
  contacted: 'Contattato',
  qualified: 'Qualificato',
  proposal: 'Proposta',
  negotiation: 'Negoziazione',
  closed_won: 'Convertito',
  closed_lost: 'Perso',
}

const leadStatusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700 border-blue-500/50',
  contacted: 'bg-purple-500/10 text-purple-700 border-purple-500/50',
  qualified: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/50',
  proposal: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/50',
  negotiation: 'bg-orange-500/10 text-orange-700 border-orange-500/50',
  closed_won: 'bg-green-500/10 text-green-700 border-green-500/50',
  closed_lost: 'bg-red-500/10 text-red-700 border-red-500/50',
}

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [lead, setLead] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchLead()
  }, [id])

  const fetchLead = async () => {
    setLoading(true)
    try {
      const response = await getCompany(parseInt(id), { include: 'contacts,activities,opportunities' })
      setLead(response.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Errore nel caricamento')
      router.push('/dashboard/leads')
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async () => {
    if (!confirm('Convertire questo lead in cliente?')) return

    try {
      await convertLeadToCustomer(parseInt(id))
      toast.success('Lead convertito in cliente con successo!')
      router.push(`/dashboard/companies/${id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Errore durante la conversione')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { icon: Flame, label: 'Hot Lead', color: 'bg-red-500/10 text-red-700' }
    if (score >= 60) return { icon: ThermometerSun, label: 'Warm', color: 'bg-orange-500/10 text-orange-700' }
    if (score >= 40) return { icon: ThermometerSun, label: 'Cold', color: 'bg-blue-500/10 text-blue-700' }
    return { icon: Snowflake, label: 'Frozen', color: 'bg-gray-500/10 text-gray-700' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!lead) return null

  const scoreBadge = getScoreBadge(lead.leadScore || 0)
  const ScoreIcon = scoreBadge.icon

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
              <h1 className="text-3xl font-bold">{lead.companyName}</h1>
              <Badge className={leadStatusColors[lead.leadStatus || 'new']}>
                {leadStatusLabels[lead.leadStatus || 'new']}
              </Badge>
              <Badge className={scoreBadge.color}>
                <ScoreIcon className="mr-1 h-3 w-3" />
                {scoreBadge.label}
              </Badge>
            </div>
            {lead.tradeName && (
              <p className="text-muted-foreground">{lead.tradeName}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Codice: {lead.code} • Lead dal {new Date(lead.createdAt).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {lead.leadStatus !== 'closed_won' && (
            <Button onClick={handleConvert}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Converti in Cliente
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/dashboard/companies/${id}/edit`)}>
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
              <DropdownMenuItem onClick={() => router.push(`/dashboard/activities/new?companyId=${id}`)}>
                <Activity className="mr-2 h-4 w-4" />
                Nuova Attività
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/opportunities/new?companyId=${id}`)}>
                <Briefcase className="mr-2 h-4 w-4" />
                Nuova Opportunità
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.open(`mailto:${lead.primaryEmail}`)}>
                <Mail className="mr-2 h-4 w-4" />
                Invia Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`tel:${lead.primaryPhone}`)}>
                <Phone className="mr-2 h-4 w-4" />
                Chiama
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Score Card */}
      <Card className="border-2" style={{ borderColor: lead.leadScore >= 80 ? '#22c55e' : lead.leadScore >= 60 ? '#3b82f6' : '#f59e0b' }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lead Score</p>
              <div className="flex items-baseline gap-3">
                <span className={`text-5xl font-bold ${getScoreColor(lead.leadScore || 0)}`}>
                  {lead.leadScore || 0}
                </span>
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <ScoreIcon className={`h-5 w-5 ${getScoreColor(lead.leadScore || 0)}`} />
                <span className="text-sm font-medium">{scoreBadge.label}</span>
              </div>
            </div>
            <div className="text-right">
              <Progress value={lead.leadScore || 0} className="h-3 w-40 mb-2" />
              <p className="text-xs text-muted-foreground">
                {lead.leadScore >= 80 ? '🔥 Priorità Massima' :
                 lead.leadScore >= 60 ? '👍 Buon Potenziale' :
                 lead.leadScore >= 40 ? '⚠️ Necessita Follow-up' :
                 '❄️ Bassa Priorità'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lead.contacts?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attività</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lead.activities?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunità</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lead.opportunities?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giorni nel Pipeline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="contacts">Contatti ({lead.contacts?.length || 0})</TabsTrigger>
          <TabsTrigger value="activities">Attività ({lead.activities?.length || 0})</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunità ({lead.opportunities?.length || 0})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Lead Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Lead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={leadStatusColors[lead.leadStatus ?? 'new']}>
                    {leadStatusLabels[lead.leadStatus ?? 'new']}
                  </Badge>
                </div>

                {lead.leadSource && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fonte</span>
                    <Badge variant="outline" className="capitalize">
                      {lead.leadSource.replace('_', ' ')}
                    </Badge>
                  </div>
                )}

                {lead.firstContactDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Primo Contatto</span>
                    <span className="text-sm font-medium">
                      {new Date(lead.firstContactDate).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                )}

                {lead.leadQualifiedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Qualificato il</span>
                    <span className="text-sm font-medium">
                      {new Date(lead.leadQualifiedDate).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                )}

                {lead.industry && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Settore</span>
                      <span className="text-sm font-medium">{lead.industry}</span>
                    </div>
                  </>
                )}

                {lead.companySize && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dimensione</span>
                    <span className="text-sm font-medium capitalize">{lead.companySize}</span>
                  </div>
                )}

                {lead.employeesCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dipendenti</span>
                    <span className="text-sm font-medium">{lead.employeesCount}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contatti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.primaryEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${lead.primaryEmail}`} className="text-sm hover:underline">
                      {lead.primaryEmail}
                    </a>
                  </div>
                )}

                {lead.primaryPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${lead.primaryPhone}`} className="text-sm hover:underline">
                      {lead.primaryPhone}
                    </a>
                  </div>
                )}

                {lead.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                      {lead.website}
                    </a>
                  </div>
                )}

                {lead.linkedinUrl && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}

                {lead.legalAddress && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium mb-1">Sede Legale</div>
                        <div className="text-muted-foreground">
                          {lead.legalAddress}<br />
                          {lead.legalPostalCode} {lead.legalCity} ({lead.legalProvince})<br />
                          {lead.legalCountry}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {lead.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descrizione</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{lead.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          {lead.internalNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Note Interne</CardTitle>
                <CardDescription>Visibili solo al team</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{lead.internalNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="h-5 w-5 text-blue-500" />
                  Pianifica Chiamata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/dashboard/activities/new?companyId=${id}&type=call`)}
                >
                  Crea Attività
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-5 w-5 text-purple-500" />
                  Invia Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`mailto:${lead.primaryEmail}`)}
                >
                  Apri Client
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-5 w-5 text-green-500" />
                  Crea Opportunità
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/dashboard/opportunities/new?companyId=${id}`)}
                >
                  Nuova Opportunità
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contatti Lead</CardTitle>
              <Button size="sm" onClick={() => router.push(`/contacts/new?companyId=${id}`)}>
                <Users className="mr-2 h-4 w-4" />
                Aggiungi Contatto
              </Button>
            </CardHeader>
            <CardContent>
              {!lead.contacts || lead.contacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun contatto presente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lead.contacts.map((contact: any) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/contacts/${contact.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {contact.firstName?.[0]}{contact.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                            {contact.isPrimary && (
                              <Star className="inline ml-2 h-3 w-3 fill-yellow-500 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contact.jobTitle || 'Nessun ruolo'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attività</CardTitle>
              <Button size="sm" onClick={() => router.push(`/dashboard/activities/new?companyId=${id}`)}>
                <Activity className="mr-2 h-4 w-4" />
                Nuova Attività
              </Button>
            </CardHeader>
            <CardContent>
              {!lead.activities || lead.activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna attività registrata</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lead.activities.map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/activities/${activity.id}`)}
                    >
                      <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{activity.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.scheduledDate).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      <Badge>{activity.status}</Badge>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Opportunità</CardTitle>
              <Button size="sm" onClick={() => router.push(`/dashboard/opportunities/new?companyId=${id}`)}>
                <Briefcase className="mr-2 h-4 w-4" />
                Nuova Opportunità
              </Button>
            </CardHeader>
            <CardContent>
              {!lead.opportunities || lead.opportunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna opportunità presente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lead.opportunities.map((opp: any) => (
                    <div
                      key={opp.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/opportunities/${opp.id}`)}
                    >
                      <div>
                        <div className="font-medium">{opp.name}</div>
                        <div className="text-sm text-muted-foreground">
                          €{opp.estimatedValue?.toLocaleString('it-IT')} • {opp.stage}
                        </div>
                      </div>
                      <Badge>{opp.probability}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}