"use client";

import { useState, useEffect } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
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
  const [searchCustomerInput, setSearchCustomerInput] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [openCustomer, setOpenCustomer] = useState(false);

  const { data, isLoading: loadingCompanies } = useCompanies({
    search: searchCustomer,
    page: 1,
    limit: 10,
  });
  const companies = data?.data || [];

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchCustomer(searchCustomerInput);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchCustomerInput]);

  const selectedCompany = companies.find(
    (c) => c.id === parseInt(companyId)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Azienda <span className="text-red-500">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCustomer}
                className="w-full justify-between"
              >
                {selectedCompany?.companyName || "Seleziona azienda..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-200">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Cerca azienda..."
                  value={searchCustomerInput}
                  onValueChange={setSearchCustomerInput}
                />
                <CommandEmpty>
                  {loadingCompanies
                    ? "Caricamento..."
                    : "Nessuna azienda trovata"}
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {companies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.id.toString()}
                      onSelect={() => {
                        onCompanyChange(company.id.toString());
                        setOpenCustomer(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          companyId === company.id.toString()
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {company.companyName} ({company.code})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
