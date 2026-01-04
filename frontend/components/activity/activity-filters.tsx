// app/components/activity/activity-filters.tsx
"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityFiltersProps {
  searchQuery: string;
  dateFilter: string;
  typeFilter: string;
  statusFilter: string;
  priorityFilter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
}

export function ActivityFilters({
  searchQuery,
  dateFilter,
  typeFilter,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onFilterChange,
}: ActivityFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cerca attività..."
          className="pl-8"
          defaultValue={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Select value={dateFilter} onValueChange={(value) => onFilterChange("date", value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte</SelectItem>
            <SelectItem value="today">Oggi</SelectItem>
            <SelectItem value="tomorrow">Domani</SelectItem>
            <SelectItem value="week">Questa settimana</SelectItem>
            <SelectItem value="overdue">In ritardo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(value) => onFilterChange("type", value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="CALL">Chiamata</SelectItem>
            <SelectItem value="EMAIL">Email</SelectItem>
            <SelectItem value="MEETING">Riunione</SelectItem>
            <SelectItem value="TASK">Task</SelectItem>
            <SelectItem value="SITE_VISIT">Visita</SelectItem>
            <SelectItem value="VIDEO_CALL">Videochiamata</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => onFilterChange("status", value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="SCHEDULED">Programmata</SelectItem>
            <SelectItem value="IN_PROGRESS">In corso</SelectItem>
            <SelectItem value="COMPLETED">Completata</SelectItem>
            <SelectItem value="CANCELLED">Annullata</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value) => onFilterChange("priority", value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priorità" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte</SelectItem>
            <SelectItem value="URGENT">Urgente</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
            <SelectItem value="MEDIUM">Media</SelectItem>
            <SelectItem value="LOW">Bassa</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
