"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Role } from "@mini-erp/shared";
import { formatDate } from "@/utils/format";

interface RoleTableRowProps {
  role: Role;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function RoleTableRow({ role, onView, onEdit, onDelete }: RoleTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">{role.code}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">{role.name}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">{role.description}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">{formatDate(role.createdAt)}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">{formatDate(role.updatedAt)}</div>
      </TableCell>
      <TableCell>
        <div className="text-center">{role.permissions?.length}</div>
      </TableCell>
      <TableCell>
        <div className="text-center">{role.userCount}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={onView} title="Visualizza">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit} title="Modifica">
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            title="Elimina"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
