// app/suppliers/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useSuppliers } from "@/hooks/use-company";
import { SupplierQueryParams } from "@/types/supplier";
import { CompanyListTable } from "@/components/company/company-list-table";
import { CompanyListSkeleton } from "@/components/company/company-list-skeleton";
import { CompanyListStats } from "@/components/company/company-list-stats";

export default function SuppliersPage() {
  const router = useRouter();

  const [params, setParams] = useState<SupplierQueryParams>({
    page: 1,
    limit: 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const { data, isLoading } = useSuppliers(params);

  const suppliers = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleSearch = (search: string) => {
    setParams({ ...params, search, page: 1 });
  };

  const handleFilterChange = (key: keyof SupplierQueryParams, value: any) => {
    setParams({ ...params, [key]: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, page });
  };

  const handleSort = (sortBy: string, sortOrder: "asc" | "desc") => {
    setParams({ ...params, sortBy, sortOrder });
  };

  if (isLoading) {
    return <CompanyListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Button onClick={() => router.push("/suppliers/new")}>
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
            value={params.search || ""}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Select
          value={params.minRating?.toString()}
          onValueChange={(value) =>
            handleFilterChange("minRating", parseInt(value))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rating minimo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Tutti</SelectItem>
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

      {/* Table */}
      <CompanyListTable
        data={suppliers}
        type="SUPPLIER"
        onSort={handleSort}
        currentPage={params.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}