"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { useCompanies } from "@/hooks/use-company";

interface CompanyCardProps {
  companyId: string;
  onCompanyChange: (companyId: string) => void;
  error?: string;
}

export default function CompanyCard({
  companyId,
  onCompanyChange,
  error,
}: CompanyCardProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading } = useCompanies({
    search: debouncedSearch,
    page: 1,
    limit: 10,
  });
  const companies = data?.data || [];

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Trasforma le companies in ComboboxOption
  const options: ComboboxOption[] = companies.map((company) => ({
    value: company.id.toString(),
    label: company.companyName,
    description: company.code,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Azienda <span className="text-red-500">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Combobox
            options={options}
            value={companyId}
            onValueChange={onCompanyChange}
            onSearchChange={setSearchInput}
            placeholder="Seleziona azienda..."
            searchPlaceholder="Cerca azienda..."
            emptyText="Nessuna azienda trovata"
            isLoading={isLoading}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
