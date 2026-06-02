"use client";

import { useState } from "react";
import { Plus, Search, Filter, Download, BrushCleaning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactQueryInput } from "@mini-erp/shared";

interface ContactToolbarProps {
  onSearch: (search: string) => void;
  onToggleFilters: () => void;
  onNewContact: () => void;
  onReset: () => void;
  onExport: (params: ContactQueryInput) => Promise<void>;
  isExporting: boolean;
  showFilters: boolean;
  initialSearch: string;
  params: ContactQueryInput;
}

export default function ContactToolbar({
  onSearch,
  onToggleFilters,
  onNewContact,
  onExport,
  onReset,
  isExporting,
  showFilters,
  initialSearch,
  params,
}: ContactToolbarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Cerca per nome, email, posizione..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Cerca</Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onToggleFilters}>
          <Filter className="w-4 h-4 mr-2" />
          Filtri
        </Button>
        <Button variant="default" onClick={onNewContact}>
          <Plus className="w-4 h-4 mr-2" />
          Nuovo
        </Button>
        <Button variant="outline" onClick={() => onExport(params)} disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button  variant="destructive" onClick={() => onReset()} title="Resetta filtri">
          <BrushCleaning className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
