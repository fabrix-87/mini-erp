// components/company/company-list-table.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Customer } from "@/types/customer";
import { Supplier } from "@/types/supplier";
import { CompanyType } from "@/types/company";
import { id } from "date-fns/locale";

interface CompanyListTableProps {
  data: (Customer | Supplier)[];
  type: CompanyType;
  onSort: (sortBy: string, sortOrder: "asc" | "desc") => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CompanyListTable({
  data,
  type,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
}: CompanyListTableProps) {
  const router = useRouter();

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleView = (id: number) => {
    const path = type === "CUSTOMER" ? "customers" : "suppliers";
    router.push(`/${path}/${id}`);
  };

  const handleEdit = (id: number) => {
    const path = type === "CUSTOMER" ? "customers" : "suppliers";
    router.push(`/${path}/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    console.log("delete");
    return;
  }

  if (data.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">
          Nessun {type === "CUSTOMER" ? "cliente" : "fornitore"} trovato
        </p>
        <Button
          variant="outline"
          onClick={() => {
            const path = type === "CUSTOMER" ? "customers" : "suppliers";
            router.push(`/${path}/new`);
          }}
        >
          Crea il primo {type === "CUSTOMER" ? "cliente" : "fornitore"}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSort("companyName", "asc")}
                  >
                    Azienda
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Dati Fiscali</TableHead>
                <TableHead>Contatti</TableHead>
                {type === "CUSTOMER" && (
                  <>
                    <TableHead>Tipo/Segmento</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </>
                )}
                {type === "SUPPLIER" && (
                  <>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Spesa</TableHead>
                  </>
                )}
                <TableHead>Stato</TableHead>
                <TableHead className="text-right w-[150px]">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const company = item.company;
                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{company?.companyName}</p>
                        {company?.tradeName && (
                          <p className="text-sm text-muted-foreground">
                            {company.tradeName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono">
                          {company?.code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {company?.vatNumber && (
                          <p className="font-mono">{company.vatNumber}</p>
                        )}
                        {company?.taxCode && (
                          <p className="font-mono text-muted-foreground">
                            {company.taxCode}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {company?.mainEmail && (
                          <p className="truncate max-w-[200px]">
                            {company.mainEmail}
                          </p>
                        )}
                        {company?.mainPhone && (
                          <p className="text-muted-foreground">
                            {company.mainPhone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    {type === "CUSTOMER" && (
                      <>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline">
                              {(item as Customer).type}
                            </Badge>
                            <Badge variant="secondary">
                              {(item as Customer).segment}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency((item as Customer).totalRevenue)}
                        </TableCell>
                      </>
                    )}
                    {type === "SUPPLIER" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>
                              {"⭐".repeat((item as Supplier).rating || 0)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({(item as Supplier).rating}/5)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency((item as Supplier).totalSpent)}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Badge
                        variant={
                          company?.status === "ACTIVE" ? "default" : "secondary"
                        }
                      >
                        {company?.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* DROPDOWN MENU (MOBILE: VISIBILE SOLO SU SCHERMI < md) */}
                      <div className="md:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleView(item.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizza
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(item.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifica
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* PULSANTI DIRETTI (DESKTOP: VISIBILE SOLO SU SCHERMI >= md) */}
                      <div className="hidden space-x-2 md:inline-flex">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleView(item.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(item.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* Puoi decidere se mostrare il tasto Elimina direttamente o lasciarlo nascosto */}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {currentPage} di {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Precedente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Successivo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
