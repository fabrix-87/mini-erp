// components/company/company-list-table.tsx
"use client";

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
import { Customer } from "@/types/customer-types";
import { Supplier } from "@/types/supplier-types";
import { CompanyType } from "@/types/company-types";
import { useNavigation } from "@/hooks/use-navigation";
import { formatCurrency } from "@/utils/format-currency";
import { useTranslations } from "next-intl";
import { PaginationInfo } from "@mini-erp/shared";
import { DataPagination } from "../ui/data-pagination";

interface CompanyListTableProps {
  data: (Customer | Supplier)[];
  type: CompanyType;
  onSort: (sortBy: string, sortOrder: "asc" | "desc") => void;
  pagination: PaginationInfo;
  paginationLimit: number;
  isLoading: boolean;
}

export function CompanyListTable({
  data,
  type,
  onSort,
  pagination,
  paginationLimit = 20,
  isLoading,
}: CompanyListTableProps) {
  const navigateEntity = type === "CUSTOMER" ? "customers" : "suppliers";
  const { navigateToDetail, navigateToEdit, navigateToNew } = useNavigation();
  const t = useTranslations(`crm.${navigateEntity}`);
  const tc = useTranslations("common");

  if (!data) {
    return "ERRORE!!!!";
  }

  const handleView = (id: string) => {
    navigateToDetail(navigateEntity, id);
  };

  const handleEdit = (id: string) => {
    navigateToEdit(navigateEntity, id);
  };

  const handleDelete = (id: string) => {
    console.log("delete");
    return;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-62.5">
                <Button variant="ghost" size="sm" onClick={() => onSort("companyName", "asc")}>
                  {t("companyName")}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>{t("fiscalData")}</TableHead>
              <TableHead>{t("contacts")}</TableHead>
              {type === "CUSTOMER" && (
                <>
                  <TableHead>
                    {t("type")}/{t("segment")}
                  </TableHead>
                  <TableHead className="text-right">{t("revenue")}</TableHead>
                </>
              )}
              {type === "SUPPLIER" && (
                <>
                  <TableHead>{t("rating")}</TableHead>
                  <TableHead className="text-right">{t("totalSpent")}</TableHead>
                </>
              )}
              <TableHead>Stato</TableHead>
              <TableHead className="text-right w-37.5">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  {tc("feedback.loading")}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <p className="text-muted-foreground mb-4">{t("no_results")}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigateToNew(navigateEntity);
                    }}
                  >
                    {t("create_new")}
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const company = item.company;
                return (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{company?.companyName}</p>
                        {company?.tradeName && (
                          <p className="text-sm text-muted-foreground">{company.tradeName}</p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono">{company?.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {company?.vatNumber && <p className="font-mono">{company.vatNumber}</p>}
                        {company?.taxCode && (
                          <p className="font-mono text-muted-foreground">{company.taxCode}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {company?.mainEmail && (
                          <p className="truncate max-w-50">{company.mainEmail}</p>
                        )}
                        {company?.mainPhone && (
                          <p className="text-muted-foreground">{company.mainPhone}</p>
                        )}
                      </div>
                    </TableCell>
                    {type === "CUSTOMER" && (
                      <>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline">{(item as Customer).type}</Badge>
                            <Badge variant="secondary">{(item as Customer).segment}</Badge>
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
                            <span>{"⭐".repeat((item as Supplier).rating || 0)}</span>
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
                      <Badge variant={company?.status === "ACTIVE" ? "default" : "secondary"}>
                        {company?.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* DROPDOWN MENU (MOBILE: VISIBILE SOLO SU SCHERMI < md) */}
                      <div className="md:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(item.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {tc("actions.view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {tc("actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {tc("actions.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* PULSANTI DIRETTI (DESKTOP: VISIBILE SOLO SU SCHERMI >= md) */}
                      <div className="hidden space-x-2 md:inline-flex">
                        <Button variant="outline" size="icon" onClick={() => handleView(item.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleEdit(item.id)}>
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
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={paginationLimit}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          itemLabel={t("entities")}
        />
      )}
    </div>
  );
}
