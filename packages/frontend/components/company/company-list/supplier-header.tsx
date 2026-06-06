"use client";

import { Plus, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupplierQueryInput } from "@mini-erp/shared";
import { CompanyListStats } from "../company-list-stats";
import { useNavigation } from "@/hooks/use-navigation";

interface Props {
    searchParams: SupplierQueryInput;
    searchInputValue: string;
    handleSearchChange: (search: string) => void;
    handleFilterChange: (ey: keyof SupplierQueryInput, value: any) => void;
}

export default function SupplierHeaderListPage({
  searchParams,
  searchInputValue,
  handleSearchChange,
  handleFilterChange
}: Props) {

  const { navigateToNew } = useNavigation()
  
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fornitori</h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi fornitori e partner
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          <Button onClick={() => navigateToNew('suppliers')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Fornitore
          </Button>
        </div>
      </div>

      {/* Stats */}
      <CompanyListStats type="SUPPLIER" />

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, email, P.IVA..."
            className="pl-10"
            value={searchInputValue || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <Select
          value={searchParams.minRating?.toString()}
          onValueChange={(value) => handleFilterChange("minRating", value)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Rating minimo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="1">⭐ 1+</SelectItem>
            <SelectItem value="2">⭐⭐ 2+</SelectItem>
            <SelectItem value="3">⭐⭐⭐ 3+</SelectItem>
            <SelectItem value="4">⭐⭐⭐⭐ 4+</SelectItem>
            <SelectItem value="5">⭐⭐⭐⭐⭐ 5</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
