"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, Globe, Hash, Star, TrendingUp, AlignLeft, CalendarDays } from "lucide-react";
import type { Currency } from "@mini-erp/shared";
import { formatDateIT } from "@/helpers/date-helper";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================================
// Types
// ============================================================================

interface CurrencyDetailDialogProps {
  currency: Currency | null;
  open: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Renders a single labeled detail row with an optional icon.
 */
function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

/**
 * Section wrapper with a title divider.
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
        {title}
      </p>
      <Separator />
      <div className="divide-y divide-border/50">{children}</div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

/**
 * Dialog that displays read-only details of a single Currency entity.
 * Renders identification, formatting, exchange-rate, and metadata sections.
 *
 * @param currency - The currency to display, or null when not selected.
 * @param open     - Controlled open state.
 * @param onOpenChange - Callback to sync open state with parent.
 */
export function CurrencyDetailDialog({
  currency,
  open,
  isLoading = false,
  onOpenChange,
}: CurrencyDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className={isLoading || !currency ? "block" : "hidden"}>
          <DialogTitle className="sr-only">Dettagli Valuta</DialogTitle>
          <DialogDescription className="sr-only">
            Visualizzazione dei dettagli e dei tassi di cambio della valuta selezionata.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          // Skeleton header + body
          <>
            <div className="flex items-center gap-3 pb-2 pt-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <CurrencyDetailSkeleton />
          </>
        ) : currency ? (
          <>
            <DialogHeader>
              {/* Header: codice + simbolo + badge stato */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg font-bold">
                  {currency.symbol}
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="flex items-center gap-2">
                    {currency.code}
                    {currency.isBaseCurrency && (
                      <Badge variant="default" className="text-xs gap-1">
                        <Star className="h-3 w-3" />
                        Base
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    {currency.translations?.[0]?.name ?? "Valuta"}
                    {currency.numericCode && ` · Codice numerico: ${currency.numericCode}`}
                  </DialogDescription>
                </div>
                <Badge variant={currency.active ? "secondary" : "outline"}>
                  {currency.active ? "Attiva" : "Inattiva"}
                </Badge>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 pb-2">
                {/* ── Identificazione ──────────────────────────────────────── */}
                <Section title="Identificazione">
                  <DetailRow
                    label="Codice ISO"
                    value={<code className="font-mono">{currency.code}</code>}
                    icon={Hash}
                  />
                  {currency.numericCode && (
                    <DetailRow
                      label="Codice numerico"
                      value={<code className="font-mono">{currency.numericCode}</code>}
                      icon={Hash}
                    />
                  )}
                  {currency.countryCode && (
                    <DetailRow
                      label="Paese"
                      value={currency.countryCode.toUpperCase()}
                      icon={Globe}
                    />
                  )}
                  <DetailRow label="Priorità" value={currency.priority} icon={TrendingUp} />
                </Section>

                {/* ── Simboli & Formattazione ───────────────────────────────── */}
                <Section title="Simboli & Formattazione">
                  <DetailRow label="Simbolo" value={currency.symbol} icon={Coins} />
                  {currency.symbolNative && (
                    <DetailRow label="Simbolo nativo" value={currency.symbolNative} icon={Coins} />
                  )}
                  <DetailRow label="Cifre decimali" value={currency.minorUnit ?? 2} />
                  <DetailRow label="Arrotondamento" value={String(currency.rounding ?? "0")} />
                </Section>

                {/* ── Tasso di cambio ───────────────────────────────────────── */}
                {currency.currentRatesFromBase?.[0] && (
                  <Section title="Tasso di cambio">
                    <DetailRow
                      label="Tasso corrente"
                      value={
                        <span className="font-mono">
                          {Number(currency.currentRatesFromBase[0].rate).toFixed(6)}
                        </span>
                      }
                      icon={TrendingUp}
                    />
                    {currency.currentRatesFromBase[0].source && (
                      <DetailRow
                        label="Fonte"
                        value={currency.currentRatesFromBase[0].source}
                        icon={AlignLeft}
                      />
                    )}
                    <DetailRow
                      label="Aggiornato il"
                      value={formatDateIT(currency.currentRatesFromBase[0].effectiveAt)}
                      icon={CalendarDays}
                    />
                  </Section>
                )}

                {/* ── Traduzioni ────────────────────────────────────────────── */}
                {currency.translations && currency.translations.length > 0 && (
                  <Section title="Traduzioni">
                    {currency.translations.map((t) => (
                      <DetailRow
                        key={t.languageId}
                        label={`Lingua ${t.language.name}`}
                        value={
                          <span>
                            {t.name}{" "}
                            <span className="text-muted-foreground font-normal">
                              / {t.namePlural}
                            </span>
                          </span>
                        }
                      />
                    ))}
                  </Section>
                )}

                {/* ── Metadata ──────────────────────────────────────────────── */}
                <Section title="Metadata">
                  <DetailRow
                    label="Creato il"
                    value={formatDateIT(currency.createdAt)}
                    icon={CalendarDays}
                  />
                  <DetailRow
                    label="Modificato il"
                    value={formatDateIT(currency.updatedAt)}
                    icon={CalendarDays}
                  />
                </Section>
              </div>
            </ScrollArea>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Skeleton placeholder shown while currency data is loading.
 */
function CurrencyDetailSkeleton() {
  return (
    <div className="space-y-4 pb-2 animate-pulse">
      {[4, 3, 2].map((rows, i) => (
        <div key={i} className="space-y-1">
          <Skeleton className="h-3 w-28" />
          <Separator />
          <div className="divide-y divide-border/50">
            {Array.from({ length: rows }).map((_, j) => (
              <div key={j} className="flex justify-between py-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
