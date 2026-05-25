// components/company/details-tabs/documents-tab.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { Plus, FileText, Eye, Calendar } from "lucide-react";
import { CompanyType } from "@/types/company-types";
import { getDocuments } from "@/lib/client/modules/document";

interface CompanyDocumentsTabProps {
  companyId: number;
  companyType: CompanyType;
}

export function CompanyDocumentsTab({
  companyId,
  companyType,
}: CompanyDocumentsTabProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["documents", { companyId, companyType }],
    queryFn: () =>
      getDocuments({
        ...(companyType === "CUSTOMER"
          ? { customerId: companyId }
          : { supplierId: companyId }),
        page: 1,
        limit: 50,
      }),
  });

  const documents = data?.data || [];

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "short",
    }).format(new Date(date));
  };

  const getDocumentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      QUOTE: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      PROFORMA: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      ORDER: "bg-green-500/10 text-green-700 border-green-500/20",
      DELIVERY_NOTE: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      INVOICE: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
      CREDIT_NOTE: "bg-red-500/10 text-red-700 border-red-500/20",
      SUPPLIER_ORDER: "bg-teal-500/10 text-teal-700 border-teal-500/20",
    };
    return colors[type] || "bg-gray-500/10 text-gray-700";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: "secondary",
      SENT: "outline",
      ACCEPTED: "default",
      DELIVERED: "default",
      PAID: "default",
      OVERDUE: "destructive",
      VOIDED: "secondary",
    };
    return variants[status] || "outline";
  };

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
        <CardTitle>Documenti ({documents.length})</CardTitle>
        <Button
          size="sm"
          onClick={() =>
            router.push(
              `/documents/new?${
                companyType === "CUSTOMER" ? "customerId" : "supplierId"
              }=${companyId}`
            )
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Documento
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nessun documento trovato
            </p>
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/documents/new?${
                    companyType === "CUSTOMER" ? "customerId" : "supplierId"
                  }=${companyId}`
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Crea il primo documento
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {doc.documentNumber || "DRAFT"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getDocumentTypeBadge(doc.documentType)}
                      >
                        {doc.documentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(doc.documentDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(doc.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(doc.status)}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/documents/${doc.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
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