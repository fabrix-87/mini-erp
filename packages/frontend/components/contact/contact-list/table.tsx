'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { Contact, ContactSortField, SortOrder } from '@/types/contact';
import ContactTableRow from './table-row';

interface ContactTableProps {
  contacts: Contact[];
  loading: boolean;
  selectedIds: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: number, checked: boolean) => void;
  onSort: (field: ContactSortField) => void;
  sort: { field: ContactSortField; order: SortOrder };
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
  onToggleActive: (id: number, currentActive: boolean) => Promise<void>;
  onSetPrimary: (id: number) => Promise<void>;
}

export default function ContactTable({
  contacts,
  loading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onSort,
  sort,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onSetPrimary,
}: ContactTableProps) {
  const SortableHeader = ({ field, children }: { field: ContactSortField; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sort.field === field && (
          <span className="text-xs">{sort.order === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={contacts.length > 0 && selectedIds.length === contacts.length}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <SortableHeader field="firstName">Nome</SortableHeader>
            <SortableHeader field="email">Email</SortableHeader>
            <TableHead>Telefono</TableHead>
            <TableHead>Azienda</TableHead>
            <SortableHeader field="position">Posizione</SortableHeader>
            <TableHead>Stato</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Caricamento...
              </TableCell>
            </TableRow>
          ) : contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nessun contatto trovato
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <ContactTableRow
                key={contact.id}
                contact={contact}
                isSelected={selectedIds.includes(contact.id)}
                onSelect={(checked) => onSelectOne(contact.id, checked)}
                onView={() => onView(contact.id)}
                onEdit={() => onEdit(contact.id)}
                onDelete={() => onDelete(contact.id)}
                onToggleActive={() => onToggleActive(contact.id, contact.active)}
                onSetPrimary={() => onSetPrimary(contact.id)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
