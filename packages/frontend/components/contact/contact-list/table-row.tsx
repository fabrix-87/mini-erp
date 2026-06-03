"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Star,
  Mail,
  Phone,
  Building2,
  Smartphone,
  CalendarPlus,
} from "lucide-react";
import type { Contact } from "@/types/contact-types";
import { toDateInput } from "@/helpers/date-helper";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";

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
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
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
        {contact.companies.length === 0 ? (
          <span className="text-sm text-muted-foreground italic">Nessuna Azienda</span>
        ) : (
          <div className="flex items-center gap-2">
            {/* 1. AZIENDA PRINCIPALE (La prima dell'array) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Building2 className="w-4 h-4 text-gray-400" />

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {contact.companies[0].company.companyName}
                  </span>
                  {/* Stellina se è il contatto principale */}
                  {contact.companies[0].isPrimaryContact && (
                    <span title="Contatto Principale" className="inline-flex items-center">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </span>
                  )}
                </div>

                {/* Sottotesto con Ruolo e Reparto (se presenti) */}
                {(contact.companies[0].position || contact.companies[0].department) && (
                  <span className="text-xs text-muted-foreground">
                    {[contact.companies[0].position, contact.companies[0].department]
                      .filter(Boolean)
                      .join(" • ")}
                  </span>
                )}
              </div>
            </div>

            {/* 2. BADGE PER ALTRE AZIENDE (Se presenti) */}
            {contact.companies.length > 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="cursor-help inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100 transition-colors"
                    >
                      +{contact.companies.length - 1}
                    </button>
                  </TooltipTrigger>

                  <TooltipContent
                    side="right"
                    className="p-3 min-w-50 bg-popover text-popover-foreground border shadow-md rounded-md"
                  >
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">
                      Altre aziende associate:
                    </p>

                    <ul className="space-y-2">
                      {contact.companies.slice(1).map((c, idx) => (
                        <li
                          key={idx}
                          className="text-sm border-t border-border pt-1.5 first:border-0 first:pt-0"
                        >
                          {/* Nome Azienda + eventuale Stellina */}
                          <div className="flex items-center gap-1 font-medium">
                            <span>{c.company.companyName}</span>
                            {c.isPrimaryContact && (
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            )}
                          </div>

                          {/* Ruolo e Reparto nel Tooltip */}
                          {(c.position || c.department) && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {[c.position, c.department].filter(Boolean).join(" | ")}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
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
        <Badge variant={contact.active ? "default" : "destructive"}>
          {contact.active ? "Attivo" : "Inattivo"}
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
            title={contact.active ? "Disattiva" : "Attiva"}
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
