// components/company/details-tabs/contacts-tab.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Mail, Phone, Star, Edit, Eye } from "lucide-react";
import contactService from "@/services/client/contact";
import { Contact } from "@/types/contact-types";
import { useUpdateURL } from "@/hooks/use-update-url";
import { useNavigation } from "@/hooks/use-navigation";

interface CompanyContactsTabProps {
  companyId: number;
}

export function CompanyContactsTab({ companyId }: CompanyContactsTabProps) {
  const { getNewRoute, navigateToDetail, navigateToEdit } = useNavigation();
  const updateURL = useUpdateURL();

  const { data, isLoading } = useQuery({
    queryKey: ["contacts", { companyId }],
    queryFn: () =>
      contactService.getAll({
        companyId,
        page: 1,
        limit: 100,
        sortOrder: "asc",
        isPrimaryContact: undefined,
        active: true,
        sortBy: "firstName",
      }),
  });

  const contacts = data?.data || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contatti ({contacts.length})</CardTitle>
        <Button size="sm" onClick={() => updateURL(getNewRoute("contacts"), { companyId })}>
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Contatto
        </Button>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nessun contatto associato</p>
            <Button
              variant="outline"
              onClick={() => updateURL(getNewRoute("contacts"), { companyId })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Crea il primo contatto
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Contatti</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact: Contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </p>
                          {contact.companies[0]?.isPrimaryContact && (
                            <Badge variant="secondary" className="mt-1">
                              <Star className="mr-1 h-3 w-3" />
                              Principale
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{contact.companies[0]?.position || "N/A"}</p>
                        {contact.companies[0]?.department && (
                          <p className="text-xs text-muted-foreground">
                            {contact.companies[0]?.department}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-50">
                              <a href={`mailto:${contact.email}`}>{contact.email}</a>
                            </span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={contact.active ? "default" : "secondary"}>
                        {contact.active ? "Attivo" : "Inattivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateToDetail("contacts", contact.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateToEdit("contacts", contact.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
