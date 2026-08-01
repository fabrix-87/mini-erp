"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Delete, Edit, Eye, Trash2 } from "lucide-react";
import { EntityPermissions, TaxRule, TaxRuleSortFields } from "@mini-erp/shared";
import { useNavigation } from "@/hooks/use-navigation";
import { formatDateIT } from "@/helpers/date-helper";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { formatTaxRate } from "@/utils/format-tax-rate";
import { getRoute } from "@/lib/navigation-routes";
import { useMemo } from "react";
import { useUpdateURL } from "@/hooks/use-update-url";
import { SortableTableHead } from "@/components/ui/sortable-table-head";

interface TaxesTableProps {
  taxRules: TaxRule[];
  isLoading: boolean;
  sortField?: TaxRuleSortFields;
  sortOrder?: "asc" | "desc";
  permissions: EntityPermissions;
  onDetailSelected: (code: string) => void;
  onUpdateSelected: (code: string) => void;
  onDeleteSelected: (code: string) => void;
}

/**
 * Renders a paginated table of tax rules with key financial metadata.
 *
 * Displays code, symbol, exchange rate, formatting settings, and status.
 * Mirrors the structure of UsersTable for UI consistency across admin sections.
 *
 * @param taxRules - Array of {@link TaxRule} entities to display
 * @param isLoading  - When true, shows a loading spinner instead of rows
 */
export function TaxRuleTable({
  taxRules,
  isLoading,
  sortOrder = "asc",
  sortField = "displayOrder",
  permissions,
  onDetailSelected,
  onUpdateSelected,
  onDeleteSelected,
}: TaxesTableProps) {
  const t = useTranslations();

  const basePath = useMemo(() => getRoute("taxes"), [getRoute]);
  const updateURL = useUpdateURL(basePath);

  const sort = {
    field: sortField,
    order: sortOrder || "asc",
  };

  const handleSort = (field: TaxRuleSortFields) => {
    const newOrder = sort.field === field && sort.order === "asc" ? "desc" : "asc";
    updateURL({ sortBy: field, sortOrder: newOrder });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {t("common.table.loading")}
        </div>
      </div>
    );
  }

  if (taxRules.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">{t("finance.taxes.no_results")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("common.table.try_to_change_search_term")}
          </p>
        </div>
      </div>
    );
  }

  const { getDetailRoute } = useNavigation();

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead<TaxRuleSortFields>
                field="displayOrder"
                sort={sort}
                onSort={handleSort}
              >
                {t("finance.taxes.rule_displayOrder")}
              </SortableTableHead>
              <SortableTableHead<TaxRuleSortFields> field="code" sort={sort} onSort={handleSort}>
                {t("finance.taxes.rule_code")}
              </SortableTableHead>
              <SortableTableHead<TaxRuleSortFields> field="name" sort={sort} onSort={handleSort}>
                {t("finance.taxes.rule_name")}
              </SortableTableHead>
              <SortableTableHead<TaxRuleSortFields> field="rate" sort={sort} onSort={handleSort}>
                {t("finance.taxes.rule_rate")}
              </SortableTableHead>
              <TableHead>{t("finance.taxes.rule_active")}</TableHead>
              <TableHead>{t("finance.taxes.rule_valid_from")}</TableHead>
              <TableHead>{t("finance.taxes.rule_valid_to")}</TableHead>
              <TableHead className="w-25 text-right" colSpan={3}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxRules.map((rule) => {
              return (
                <TableRow key={rule.id} className="group">
                  <TableCell className="font-mono font-medium">{rule.displayOrder}</TableCell>
                  <TableCell className="font-mono font-medium">{rule.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{rule.name}</span>
                      <span className="text-xs text-muted-foreground">({rule.description})</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {formatTaxRate(rule.rate)}
                  </TableCell>

                  {/* Active / inactive status */}
                  <TableCell>
                    <Badge
                      variant={rule.active ? "default" : "secondary"}
                      className={rule.active ? "bg-green-500" : "bg-red-500"}
                    >
                      {rule.active ? t("common.status.active") : t("common.status.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateIT(rule.validFrom)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateIT(rule.validTo)}
                  </TableCell>

                  {/* Detail link */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDetailSelected(rule.code)}
                      title="Visualizza dettagli"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  {/* Update link */}
                  {permissions.canUpdate && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onUpdateSelected(rule.code)}
                        title="Modifica"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                  {/* Delete link */}
                  {permissions.canDelete && (
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDeleteSelected(rule.code)}
                        title="Elimina"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
