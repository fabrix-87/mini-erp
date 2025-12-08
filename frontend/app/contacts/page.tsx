// app/contacts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  UserPlus,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Contact } from "@/types/contact";
import { getContacts } from "@/lib/api/modules/contact";

const contactTypeColors: Record<string, string> = {
  primary: "bg-blue-500/10 text-blue-700",
  billing: "bg-green-500/10 text-green-700",
  technical: "bg-purple-500/10 text-purple-700",
  decision_maker: "bg-orange-500/10 text-orange-700",
  influencer: "bg-cyan-500/10 text-cyan-700",
  other: "bg-gray-500/10 text-gray-700",
};

const salutationLabels: Record<string, string> = {
  mr: "Sig.",
  ms: "Sig.ra",
  mrs: "Sig.ra",
  dr: "Dott.",
  prof: "Prof.",
};

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);

  useEffect(() => {
    fetchContacts();
  }, [page, typeFilter, searchQuery]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 20,
        sortBy: "lastName",
        sortOrder: "ASC",
      };

      if (typeFilter !== "all") params.contactType = typeFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await getContacts(params);
      setContacts(response.data);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalContacts(response.pagination?.totalItems || 0);
      console.log(contacts);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Errore nel caricamento dei contatti"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contatti</h1>
          <p className="text-muted-foreground">
            Gestisci i contatti delle tue aziende
          </p>
        </div>
        <Button onClick={() => router.push("/contacts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Contatto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totale Contatti
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contatti Principali
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.isPrimary).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Decision Maker
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.isDecisionMaker).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attivi</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cerca per nome, email, telefono..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo contatto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="primary">Principale</SelectItem>
                <SelectItem value="billing">Amministrativo</SelectItem>
                <SelectItem value="technical">Tecnico</SelectItem>
                <SelectItem value="decision_maker">Decision Maker</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
                <SelectItem value="other">Altro</SelectItem>
              </SelectContent>
            </Select>
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
                    <TableHead>Contatto</TableHead>
                    <TableHead>Azienda</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contatti</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nessun contatto trovato
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => (
                      <TableRow
                        key={contact.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/contacts/${contact.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-sm font-semibold">
                                {contact.firstName?.[0]}
                                {contact.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {contact.salutation
                                    ? salutationLabels[contact.salutation]
                                    : ""}{" "}
                                  {contact.firstName} {contact.lastName}
                                </span>
                                {contact.isPrimary && (
                                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                                )}
                                {contact.isDecisionMaker && (
                                  <Briefcase className="h-3.5 w-3.5 text-orange-500" />
                                )}
                              </div>
                              {contact.jobTitle && (
                                <div className="text-sm text-muted-foreground">
                                  {contact.jobTitle}
                                  {contact.department &&
                                    ` • ${contact.department}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">
                                {contact.Company?.companyName ||
                                  "Nessuna azienda"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {contact.Company?.code}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={contactTypeColors[contact.contactType]}
                          >
                            {contact.contactType.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {contact.email && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </div>
                            )}
                            {(contact.mobile || contact.phone) && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {contact.mobile || contact.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={contact.active ? "default" : "secondary"}
                          >
                            {contact.active ? "Attivo" : "Inattivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/contacts/${contact.id}`);
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
                    Pagina {page} di {totalPages} ({totalContacts} contatti
                    totali)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Precedente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
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
    </div>
  );
}
