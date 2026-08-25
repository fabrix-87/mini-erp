"use client";

import { useEffect, useState } from "react";
import { useFormContext, useController } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Star, StarOff } from "lucide-react";
import { useCompanies } from "@/hooks/use-company";
import type { CreateContactForm } from "@mini-erp/shared";

// ============================================================================
// TYPES
// ============================================================================

interface SelectedCompany {
  /** RHF field id */
  id: string;
  companyId: string | number;
  position?: string | null;
  department?: string | null;
  isPrimaryContact?: boolean;
}

interface CompanyCardProps {
  selectedCompanies: SelectedCompany[];
  onAddCompany: (companyId: string) => void;
  onRemoveCompany: (index: number) => void;
  /** Called when user toggles the primary flag on an entry */
  onSetPrimary: (index: number) => void;
  /** Pre-populated map of companyId → companyName for already-associated companies */
  initialNameMap?: Record<string, string>;
  error?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card component for managing company associations on a contact.
 * Allows adding/removing companies and editing position, department,
 * and isPrimaryContact for each association.
 */
export default function CompanyCard({
  selectedCompanies,
  onAddCompany,
  onRemoveCompany,
  onSetPrimary,
  initialNameMap,
  error,
}: CompanyCardProps) {
  const { register } = useFormContext<CreateContactForm>();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [companyNameMap, setCompanyNameMap] = useState<Record<string, string>>(
    initialNameMap ?? {},
  );

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  // ── Fetch companies ────────────────────────────────────────────────────────
  const { data, isLoading } = useCompanies({
    search: debouncedSearch,
    page: 1,
    limit: 10,
    sortOrder: "asc",
    sortBy: "code",
  });
  const companies = data?.data ?? [];

  // ── Keep name map for display ──────────────────────────────────────────────
  useEffect(() => {
    if (companies.length > 0) {
      setCompanyNameMap((prev) => ({
        ...prev,
        ...Object.fromEntries(companies.map((c) => [c.id.toString(), c.companyName])),
      }));
    }
  }, [companies]);

  // ── Build combobox options (exclude already selected) ─────────────────────
  const selectedIds = selectedCompanies.map((c) => c.companyId.toString());

  const options: ComboboxOption[] = companies
    .filter((c) => !selectedIds.includes(c.id.toString()))
    .map((c) => ({
      value: c.id.toString(),
      label: c.companyName,
      description: c.code,
    }));

  const handleSelect = (companyId: string) => {
    if (!companyId || selectedIds.includes(companyId)) return;
    onAddCompany(companyId);
    setSearchInput("");
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Aziende <span className="text-red-500">*</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Company entries ─────────────────────────────────────────────── */}
        {selectedCompanies.length > 0 && (
          <div className="space-y-3">
            {selectedCompanies.map((company, index) => (
              <div key={company.id} className="rounded-md border p-3 space-y-3">
                {/* Row: name + primary toggle + remove */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">
                      {companyNameMap[company.companyId.toString()] ??
                        `Company #${company.companyId}`}
                    </span>
                    {company.isPrimaryContact && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Primario
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle primary */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title={
                        company.isPrimaryContact
                          ? "Contatto primario (clicca per rimuovere)"
                          : "Imposta come primario"
                      }
                      onClick={() => onSetPrimary(index)}
                    >
                      {company.isPrimaryContact ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>

                    {/* Remove */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-destructive"
                      aria-label="Rimuovi azienda"
                      onClick={() => onRemoveCompany(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Position + Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`companies.${index}.position`}>Posizione</Label>
                    <Input
                      id={`companies.${index}.position`}
                      placeholder="es. Responsabile acquisti"
                      {...register(`companies.${index}.position`)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`companies.${index}.department`}>Dipartimento</Label>
                    <Input
                      id={`companies.${index}.department`}
                      placeholder="es. Amministrazione"
                      {...register(`companies.${index}.department`)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Combobox add company ─────────────────────────────────────────── */}
        <Combobox
          options={options}
          value=""
          onValueChange={handleSelect}
          onSearchChange={setSearchInput}
          placeholder="Aggiungi azienda..."
          searchPlaceholder="Cerca azienda..."
          emptyText="Nessuna azienda trovata"
          isLoading={isLoading}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
