// app/(dashboard)/leads/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, TrendingUp, Users, Target, Mail, Phone, MapPin, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { LeadStats } from '@/types/lead'
import { getCompanies, getLeadStats } from '@/lib/api/modules/company'
import { Company } from '@/types/company'

const leadStatusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  contacted: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  qualified: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  proposal: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  negotiation: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  closed_won: 'bg-green-500/10 text-green-700 dark:text-green-400',
  closed_lost: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

const leadStatusLabels: Record<string, string> = {
  new: 'Nuovo',
  contacted: 'Contattato',
  qualified: 'Qualificato',
  proposal: 'Proposta',
  negotiation: 'Negoziazione',
  closed_won: 'Convertito',
  closed_lost: 'Perso',
}

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Company[]>([])
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [page, statusFilter, sourceFilter, scoreFilter, searchQuery])

  const fetchStats = async () => {
    try {
      const response = await getLeadStats()      
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params: any = {
        page,
        limit: 20,
        type: 'lead',
        sortBy: 'leadScore',
        sortOrder: 'DESC'
      }

      if (statusFilter !== 'all') params.leadStatus = statusFilter
      if (searchQuery) params.search = searchQuery

      const response = await getCompanies(params)
      setLeads(response.data)
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Errore nel caricamento dei lead')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-bold'
    if (score >= 60) return 'text-blue-600 font-semibold'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'Hot 🔥'
    if (score >= 60) return 'Warm'
    if (score >= 40) return 'Cold'
    return 'Frozen'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Pipeline</h1>
          <p className="text-muted-foreground">
            Gestisci e qualifica i tuoi lead commerciali
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/companies/new?type=lead')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Lead
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Lead</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuovi</CardTitle>
              <Star className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new}</div>
              <Progress value={(stats.new / stats.total) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contattati</CardTitle>
              <Phone className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contacted}</div>
              <Progress value={(stats.contacted / stats.total) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualificati</CardTitle>
              <Target className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualified}</div>
              <Progress value={(stats.qualified / stats.total) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Medio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}</div>
              <div className="text-xs text-muted-foreground mt-1">su 100</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conv. Rate</CardTitle>
              <ArrowRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">→ clienti</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cerca per nome, P.IVA, email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli status</SelectItem>
                  <SelectItem value="new">Nuovo</SelectItem>
                  <SelectItem value="contacted">Contattato</SelectItem>
                  <SelectItem value="qualified">Qualificato</SelectItem>
                  <SelectItem value="proposal">Proposta</SelectItem>
                  <SelectItem value="negotiation">Negoziazione</SelectItem>
                </SelectContent>
              </Select>

              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="hot">Hot (80+)</SelectItem>
                  <SelectItem value="warm">Warm (60-79)</SelectItem>
                  <SelectItem value="cold">Cold (40-59)</SelectItem>
                  <SelectItem value="frozen">Frozen (&lt;40)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le fonti</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contatti</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nessun lead trovato
                      </TableCell>
                    </TableRow>
                  ) : (
                    leads.map((lead) => (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{lead.companyName}</div>
                              {lead.tradeName && (
                                <div className="text-sm text-muted-foreground">
                                  {lead.tradeName}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {lead.code}
                                {lead.vatNumber && ` • P.IVA: ${lead.vatNumber}`}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <div className={`text-2xl font-bold ${getScoreColor(lead.leadScore || 0)}`}>
                              {lead.leadScore || 0}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getScoreBadge(lead.leadScore || 0)}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={leadStatusColors[lead.leadStatus ?? 'new']}
                          >
                            {leadStatusLabels[lead.leadStatus ?? 'new'] || lead.leadStatus}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {lead.primaryEmail && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">
                                  {lead.primaryEmail}
                                </span>
                              </div>
                            )}
                            {lead.primaryPhone && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {lead.primaryPhone}
                              </div>
                            )}
                            {lead.contacts && lead.contacts.length > 0 && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {lead.contacts.length} contatti
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {lead.leadSource && (
                            <Badge variant="outline" className="capitalize">
                              {lead.leadSource.replace('_', ' ')}
                            </Badge>
                          )}
                          {lead.legalCity && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {lead.legalCity}
                              {lead.legalProvince && ` (${lead.legalProvince})`}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(lead.createdAt).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/dashboard/companies/${lead.id}`)
                            }}
                          >
                            Dettagli
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Pagina {page} di {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Precedente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Successiva
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-500" />
              Chiamate da Fare
            </CardTitle>
            <CardDescription>
              Lead con priorità alta da contattare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/dashboard/activities/new?type=call')}
            >
              Pianifica Chiamata
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-500" />
              Email Follow-up
            </CardTitle>
            <CardDescription>
              Invia email di follow-up ai lead qualificati
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/dashboard/activities/new?type=email')}
            >
              Invia Email
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Converti in Cliente
            </CardTitle>
            <CardDescription>
              Lead pronti per la conversione
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                toast.info('Seleziona un lead qualificato dalla lista')
              }}
            >
              Converti Lead
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}