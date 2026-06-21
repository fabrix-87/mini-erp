"use client";

import { useState } from "react";
import { Plus, Search, Filter, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RoleToolbarProps {
  onSearch: (search: string) => void;
  onNewRole: () => void;
  initialSearch: string;
}

export default function RoleToolbar({ onSearch, onNewRole, initialSearch }: RoleToolbarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  /** Clears the search input and triggers a search with empty string */
  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
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
            placeholder="Cerca per nome o codice"
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cancella ricerca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch}>Cerca</Button>
      </div>

      <div className="flex gap-2">
        <Button variant="default" onClick={onNewRole}>
          <Plus className="w-4 h-4 mr-2" />
          Nuovo
        </Button>
      </div>
    </div>
  );
}
