"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Contact, ContactSortField } from "@/types/contact-types";
import ContactTableRow from "./contact-table-row";
import { SortOrder } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

interface ContactTableProps {
  contacts: Contact[];
  loading: boolean;
  onSort: (field: ContactSortField) => void;
  sort: { field: ContactSortField; order: SortOrder };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (id: string, currentActive: boolean) => Promise<void>;
}

export default function ContactTable({
  contacts,
  loading,
  onSort,
  sort,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: ContactTableProps) {
  const t = useTranslations();

  const SortableHeader = ({
    field,
    children,
  }: {
    field: ContactSortField;
    children: React.ReactNode;
  }) => (
    <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => onSort(field)}>
      <div className="flex items-center gap-2">
        {children}
        {sort.field === field && (
          <span className="text-xs">{sort.order === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>           
            <SortableHeader field="firstName">Nome</SortableHeader>
            <SortableHeader field="email">Email</SortableHeader>
            <TableHead>Telefono</TableHead>
            <TableHead>Azienda</TableHead>
            <TableHead>Cellulare</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Data creazione</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                {t('common.table.loading')}
              </TableCell>
            </TableRow>
          ) : contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                {t('common.table.no_results')}
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <ContactTableRow
                key={contact.id}
                contact={contact}
                onView={() => onView(contact.id)}
                onEdit={() => onEdit(contact.id)}
                onDelete={() => onDelete(contact.id)}
                onToggleActive={() => onToggleActive(contact.id, contact.active)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
