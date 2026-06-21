'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import RoleTableRow from './table-row';
import { Role, RoleSortField, SortOrder } from '@mini-erp/shared';
import { SortableTableHead } from '@/components/ui/sortable-table-head';

interface RoleTableProps {
  roles: Role[];
  loading: boolean;
  onSort: (field: RoleSortField) => void;
  sort: { field: RoleSortField; order: SortOrder };
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number, name: string) => Promise<void>;
}

export default function RoleTable({
  roles,
  loading,
  onSort,
  sort,
  onView,
  onEdit,
  onDelete,
}: RoleTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead<RoleSortField> field="code" sort={sort} onSort={onSort}>
                Codice
            </SortableTableHead>
            <SortableTableHead<RoleSortField> field="name" sort={sort} onSort={onSort}>
                Nome
            </SortableTableHead>
            <TableHead>Descrizione</TableHead>
            <SortableTableHead<RoleSortField> field="createdAt" sort={sort} onSort={onSort}>
                Data creazione
            </SortableTableHead>
            <SortableTableHead<RoleSortField> field="updatedAt" sort={sort} onSort={onSort}>
                Ultima modifica
            </SortableTableHead>
            <TableHead className="text-center">Permessi</TableHead>
            <TableHead className="text-center">Scope</TableHead>
            <TableHead className="text-center">Utenti</TableHead>
            <TableHead className="text-center">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Caricamento...
              </TableCell>
            </TableRow>
          ) : roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nessun ruolo trovato
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <RoleTableRow
                key={role.id}
                role={role}
                onView={() => onView(role.id)}
                onEdit={() => onEdit(role.id)}
                onDelete={() => onDelete(role.id, role.name)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
