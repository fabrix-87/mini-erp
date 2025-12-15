"use client";

import { useState } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ContactToolbarProps {
  onSearch: (search: string) => void;
  onToggleFilters: () => void;
  onNewContact: () => void;
  onExport: () => Promise<void>;
  isExporting: boolean;
  showFilters: boolean;
  initialSearch: string;
}

export default function ContactToolbar({
  onSearch,
  onToggleFilters,
  onNewContact,
  onExport,
  isExporting,
  showFilters,
  initialSearch,
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
        <Button variant="outline" onClick={onExport} disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
