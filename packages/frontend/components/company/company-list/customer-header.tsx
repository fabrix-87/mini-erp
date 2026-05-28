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
import { CustomerQueryInput } from "@mini-erp/shared";
import { CompanyListStats } from "../company-list-stats";
import { useRouter } from "next/navigation";

interface Props {
    searchParams: CustomerQueryInput;
    searchInputValue: string;
    handleSearchChange: (search: string) => void;
    handleFilterChange: (ey: keyof CustomerQueryInput, value: any) => void;
}

export default function CustomerHeaderListPage({
  searchParams,
  searchInputValue,
  handleSearchChange,
  handleFilterChange
}: Props) {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clienti</h1>
          <p className="text-muted-foreground">Gestisci i tuoi clienti e lead</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          <Button onClick={() => router.push("/customers/new")}>
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
            value={searchInputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <Select value={searchParams.type} onValueChange={(value) => handleFilterChange("type", value)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="PROSPECT">Prospect</SelectItem>
            <SelectItem value="CUSTOMER">Cliente</SelectItem>
            <SelectItem value="PARTNER">Partner</SelectItem>
            <SelectItem value="OTHER">Altro</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.segment}
          onValueChange={(value) => handleFilterChange("segment", value)}
        >
          <SelectTrigger className="w-45">
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

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
