'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, UserCheck, UserX, Star, Mail, Phone, Building2, Smartphone, CalendarPlus } from 'lucide-react';
import type { Contact } from '@/types/contact-types';
import { toDateInput } from '@/helpers/date-helper';

interface ContactTableRowProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

export default function ContactTableRow({
  contact,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
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
        {contact.companies.length == 0 ? "Nessuna Azienda" : (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{contact.companies[0].company.companyName}</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        {contact.mobilePhone && (
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{contact.mobilePhone}</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={contact.active ? 'default' : 'secondary'}>
          {contact.active ? 'Attivo' : 'Inattivo'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <CalendarPlus className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{toDateInput(contact.createdAt)}</span>
        </div>
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
