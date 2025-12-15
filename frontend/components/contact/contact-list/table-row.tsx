'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, UserCheck, UserX, Star, Mail, Phone, Building2 } from 'lucide-react';
import type { Contact } from '@/types/contact';

interface ContactTableRowProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onSetPrimary: () => void;
}

export default function ContactTableRow({
  contact,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onSetPrimary,
}: ContactTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium">
              {contact.firstName} {contact.lastName}
            </div>
            {contact.isPrimaryContact && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <Star className="w-3 h-3 fill-current" />
                Primario
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{contact.email}</span>
        </div>
      </TableCell>
      <TableCell>
        {contact.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{contact.phone}</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        {contact.company && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{contact.company.companyName}</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm">{contact.position}</span>
      </TableCell>
      <TableCell>
        <Badge variant={contact.active ? 'default' : 'secondary'}>
          {contact.active ? 'Attivo' : 'Inattivo'}
        </Badge>
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
            onClick={onToggleActive}
            title={contact.active ? 'Disattiva' : 'Attiva'}
          >
            {contact.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </Button>
          {!contact.isPrimaryContact && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSetPrimary}
              title="Imposta come primario"
            >
              <Star className="w-4 h-4" />
            </Button>
          )}
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
