import { ChangeEvent, ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, ChevronDown } from 'lucide-react';
import { FormField } from './FormField';

interface Filters {
  documentType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClear: () => void;
}

export function FilterPanel({
  filters,
  onFilterChange,
  onClear
}: FilterPanelProps): ReactNode {
  const [open, setOpen] = useState(false);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target as { name: keyof Filters; value: string };
    onFilterChange(name, value);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter size={16} />
          Filtri
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-4">
        <div className="space-y-4">
          <FormField
            label="Tipo Documento"
            type="select"
            name="documentType"
            value={filters.documentType || ''}
            onChange={handleFilterChange}
            options={[
              { value: 'quote', label: 'Preventivo' },
              { value: 'order', label: 'Ordine' },
              { value: 'invoice', label: 'Fattura' }
            ]}
          />

          <FormField
            label="Status"
            type="select"
            name="status"
            value={filters.status || ''}
            onChange={handleFilterChange}
            options={[
              { value: 'draft', label: 'Bozza' },
              { value: 'sent', label: 'Inviato' },
              { value: 'paid', label: 'Pagato' }
            ]}
          />

          <FormField
            label="Da Data"
            type="date"
            name="dateFrom"
            value={filters.dateFrom || ''}
            onChange={handleFilterChange}
          />

          <FormField
            label="A Data"
            type="date"
            name="dateTo"
            value={filters.dateTo || ''}
            onChange={handleFilterChange}
          />

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Azzera
            </Button>
            <Button onClick={() => setOpen(false)} size="sm" className="flex-1">
              Applica
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}