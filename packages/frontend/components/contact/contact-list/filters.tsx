'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { ContactFilters as ContactFiltersType } from '@/types/contact';

interface ContactFiltersProps {
  filters: ContactFiltersType;
  onFilterChange: (filters: Record<string, any>) => void;
}

export default function ContactFilters({ filters, onFilterChange }: ContactFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<string>(
    filters.active === undefined ? 'all' : filters.active ? 'active' : 'inactive'
  );
  const [departmentFilter, setDepartmentFilter] = useState(filters.department || '');

  return (
    <div className="rounded-lg border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status-filter">Stato</Label>
          <Select
            value={activeFilter}
            onValueChange={(value) => {
              setActiveFilter(value);
              const active = value === 'all' ? undefined : value === 'active';
              onFilterChange({ active });
            }}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Seleziona stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="active">Attivi</SelectItem>
              <SelectItem value="inactive">Inattivi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department-filter">Dipartimento</Label>
          <Input
            id="department-filter"
            type="text"
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              onFilterChange({ department: e.target.value });
            }}
            placeholder="Filtra per dipartimento"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary-filter">Tipo contatto</Label>
          <Select
            value={filters.isPrimaryContact === undefined ? 'all' : filters.isPrimaryContact ? 'primary' : 'secondary'}
            onValueChange={(value) => {
              const isPrimaryContact = value === 'all' ? undefined : value === 'primary';
              onFilterChange({ isPrimaryContact });
            }}
          >
            <SelectTrigger id="primary-filter">
              <SelectValue placeholder="Seleziona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="primary">Primari</SelectItem>
              <SelectItem value="secondary">Secondari</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
