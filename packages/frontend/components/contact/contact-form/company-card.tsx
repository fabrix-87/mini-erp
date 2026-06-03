"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCompanies } from "@/hooks/use-company";

interface SelectedCompany {
  id: string; // field id di RHF
  companyId: string | number;
  position?: string | null;
  department?: string | null;
  isPrimaryContact?: boolean;
}

interface CompanyCardProps {
  selectedCompanies: SelectedCompany[];
  onAddCompany: (companyId: string) => void;
  onRemoveCompany: (index: number) => void;
  error?: string;
}

export default function CompanyCard({
  selectedCompanies,
  onAddCompany,
  onRemoveCompany,
  error,
}: CompanyCardProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [companyNameMap, setCompanyNameMap] = useState<Record<string, string>>({});

  const { data, isLoading } = useCompanies({
    search: debouncedSearch,
    page: 1,
    limit: 10,
    sortOrder: "asc",
    sortBy: "code",
  });
  const companies = data?.data || [];

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (companies.length > 0) {
      setCompanyNameMap((prev) => ({
        ...prev,
        ...Object.fromEntries(companies.map((c) => [c.id.toString(), c.companyName])),
      }));
    }
  }, [companies]);

  // Escludi le company già selezionate dalle opzioni
  const selectedIds = selectedCompanies.map((c) => c.companyId.toString());

  const options: ComboboxOption[] = companies
    .filter((company) => !selectedIds.includes(company.id.toString()))
    .map((company) => ({
      value: company.id.toString(),
      label: company.companyName,
      description: company.code,
    }));

  const handleSelect = (companyId: string) => {
    if (!companyId || selectedIds.includes(companyId)) return;
    onAddCompany(companyId);
    setSearchInput(""); // reset ricerca dopo selezione
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Aziende <span className="text-red-500">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Company già selezionate */}
        {selectedCompanies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCompanies.map((company, index) => (
              <Badge key={company.id} variant="secondary" className="gap-1 pr-1">
                <span>
                  {companyNameMap[company.companyId.toString()] ?? `Company #${company.companyId}`}
                </span>
                {company.isPrimaryContact && (
                  <span className="text-xs text-muted-foreground ml-1">(primario)</span>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveCompany(index)}
                  className="ml-1 hover:text-destructive"
                  aria-label="Rimuovi azienda"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Combobox per aggiungere */}
        <Combobox
          options={options}
          value="" // sempre vuoto — è un "aggiungi", non un "seleziona"
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
