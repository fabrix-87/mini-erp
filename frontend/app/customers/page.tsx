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
import { useCustomers } from "@/hooks/use-company";
import { CustomerQueryParams } from "@/types/customer";
import { CompanyListTable } from "@/components/company/company-list-table";
import { CompanyListSkeleton } from "@/components/company/company-list-skeleton";
import { CompanyListStats } from "@/components/company/company-list-stats";

export default function CustomersPage() {
  const router = useRouter();

  const [params, setParams] = useState<CustomerQueryParams>({
    page: 1,
    limit: 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const { data, isLoading } = useCustomers(params);

  const customers = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleSearch = (search: string) => {
    setParams({ ...params, search, page: 1 });
  };

  const handleFilterChange = (key: keyof CustomerQueryParams, value: any) => {
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
          <h1 className="text-3xl font-bold">Clienti</h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi clienti e lead
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          <Button onClick={() => router.push("/dashboard/customers/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Cliente
          </Button>
        </div>
      </div>

      {/* Stats */}
      <CompanyListStats type="CUSTOMER" />

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
          value={params.type}
          onValueChange={(value) => handleFilterChange("type", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
            <SelectItem value="PROSPECT">Prospect</SelectItem>
            <SelectItem value="CUSTOMER">Cliente</SelectItem>
            <SelectItem value="PARTNER">Partner</SelectItem>
            <SelectItem value="OTHER">Altro</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.segment}
          onValueChange={(value) => handleFilterChange("segment", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i segmenti</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
            <SelectItem value="GOLD">Gold</SelectItem>
            <SelectItem value="SILVER">Silver</SelectItem>
            <SelectItem value="BRONZE">Bronze</SelectItem>
            <SelectItem value="STANDARD">Standard</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.leadStatus}
          onValueChange={(value) => handleFilterChange("leadStatus", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lead Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli status</SelectItem>
            <SelectItem value="NEW">Nuovo</SelectItem>
            <SelectItem value="CONTACTED">Contattato</SelectItem>
            <SelectItem value="QUALIFIED">Qualificato</SelectItem>
            <SelectItem value="PROPOSAL">Proposta</SelectItem>
            <SelectItem value="NEGOTIATION">Negoziazione</SelectItem>
            <SelectItem value="CLOSED_WON">Chiuso Vinto</SelectItem>
            <SelectItem value="CLOSED_LOST">Chiuso Perso</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <CompanyListTable
        data={customers}
        type="CUSTOMER"
        onSort={handleSort}
        currentPage={params.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}