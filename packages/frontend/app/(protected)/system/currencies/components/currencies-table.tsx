// packages/frontend/app/(protected)/system/currencies/components/currencies-table.tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { Currency } from "@mini-erp/shared";
import { useNavigation } from "@/hooks/use-navigation";
import { formatDateIT } from "@/helpers/date-helper";

interface CurrenciesTableProps {
  currencies: Currency[];
  isLoading: boolean;
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
export function CurrenciesTable({ currencies, isLoading }: CurrenciesTableProps) {
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

  const { getDetailRoute } = useNavigation();

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codice</TableHead>
              <TableHead>Simbolo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tasso di cambio</TableHead>
              <TableHead>Formattazione</TableHead>
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
                  {/* ISO 4217 code */}
                  <TableCell className="font-mono font-medium">
                    {currency.code}
                  </TableCell>

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
                  <TableCell className="text-muted-foreground">
                    {translationName}
                  </TableCell>

                  {/* Exchange rate toward base currency */}
                  <TableCell className="tabular-nums">
                    {currency.isBaseCurrency ? (
                      <span className="text-muted-foreground text-sm">—</span>
                    ) : (
                      Number(currency.exchangeRate).toFixed(6)
                    )}
                  </TableCell>

                  {/* Decimal digits + separators */}
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {currency.decimalDigits}d &nbsp;
                    {currency.decimalSeparator}
                    {currency.thousandSeparator}
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
                    <Link
                      href={getDetailRoute("currencies", currency.code)}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Dettagli
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}