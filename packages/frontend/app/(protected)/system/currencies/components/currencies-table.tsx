// packages/frontend/app/(protected)/system/currencies/components/currencies-table.tsx
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
import { Currency, EntityPermissions } from "@mini-erp/shared";
import { useNavigation } from "@/hooks/use-navigation";
import { formatDateIT } from "@/helpers/date-helper";
import { Button } from "@/components/ui/button";

interface CurrenciesTableProps {
  currencies: Currency[];
  isLoading: boolean;
  permissions: EntityPermissions;
  onDetailSelected: (code: string) => void;
  onUpdateSelected: (code: string) => void;
  onDeleteSelected: (code: string) => void;
}

/**
 * Renders a paginated table of currencies with key financial metadata.
 *
 * Displays code, symbol, exchange rate, formatting settings, and status.
 * Mirrors the structure of UsersTable for UI consistency across admin sections.
 *
 * @param currencies - Array of {@link Currency} entities to display
 * @param isLoading  - When true, shows a loading spinner instead of rows
 */
export function CurrenciesTable({
  currencies,
  isLoading,
  permissions,
  onDetailSelected,
  onUpdateSelected,
  onDeleteSelected,
}: CurrenciesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Aggiornamento in corso...
        </div>
      </div>
    );
  }

  if (currencies.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Nessuna valuta trovata</p>
          <p className="text-sm text-muted-foreground mt-1">
            Prova a modificare i filtri di ricerca
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Priorità</TableHead>
              <TableHead>Codice</TableHead>
              <TableHead>Simbolo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Codice numerico</TableHead>
              <TableHead>Decimali</TableHead>
              <TableHead className="w-25">Valuta base</TableHead>
              <TableHead className="w-25">Stato</TableHead>
              <TableHead>Aggiornato</TableHead>
              <TableHead className="w-25 text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.map((currency) => {
              /** Resolve the primary translation name (first available) */
              const translationName = currency.translations?.[0]?.name ?? "-";

              return (
                <TableRow key={currency.code} className="group">
                  <TableCell className="font-mono font-medium">{currency.priority}</TableCell>

                  {/* ISO 4217 code */}
                  <TableCell className="font-mono font-medium">{currency.code}</TableCell>

                  {/* Symbol + native symbol */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{currency.symbol}</span>
                      {currency.symbolNative !== currency.symbol && (
                        <span className="text-xs text-muted-foreground">
                          ({currency.symbolNative})
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Translated name */}
                  <TableCell className="text-muted-foreground">{translationName}</TableCell>

                  <TableCell className="font-mono font-medium">{currency.numericCode}</TableCell>

                  {/* Decimal digits + separators */}
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {currency.minorUnit} (
                    {currency.minorUnit === 0 ? "0" : `0,${"0".repeat(currency.minorUnit)}`})
                  </TableCell>

                  {/* Is base currency badge */}
                  <TableCell>
                    {currency.isBaseCurrency ? (
                      <Badge variant="secondary" className="bg-blue-500 text-white">
                        Base
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Active / inactive status */}
                  <TableCell>
                    <Badge
                      variant={currency.active ? "default" : "secondary"}
                      className={currency.active ? "bg-green-500" : "bg-red-500"}
                    >
                      {currency.active ? "Attiva" : "Inattiva"}
                    </Badge>
                  </TableCell>

                  {/* Last exchange rate update */}
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateIT(currency.exchangeRateUpdated)}
                  </TableCell>

                  {/* Detail link */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDetailSelected(currency.code)}
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
                        onClick={() => onUpdateSelected(currency.code)}
                        title="Modifica"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                  {/* Delete link */}
                  {permissions.canDelete && !currency.isBaseCurrency && (
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDeleteSelected(currency.code)}
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
