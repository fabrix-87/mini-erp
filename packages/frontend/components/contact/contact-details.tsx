"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  Smartphone,
  Building2,
  Briefcase,
  Users,
  Star,
  Calendar,
  MessageSquare,
  UserCheck,
  UserX,
  ExternalLink,
} from "lucide-react";
import { useContactMutations } from "@/hooks/use-contact";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Contact } from "@mini-erp/shared";
import { formatDateIT } from "@/helpers/date-helper";

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  contactId: number;
  contact: Contact;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Returns up to two uppercase initials from first + last name.
 */
function getInitials(firstName: string, lastName?: string | null): string {
  return [firstName[0], lastName?.[0]].filter(Boolean).join("").toUpperCase();
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * A single info row with icon, label and value (or link).
 */
function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            className="text-sm font-medium text-primary hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Full contact detail view with header, company associations,
 * contact info, notes and metadata sidebar.
 */
export default function ContactDetails({ contact, contactId }: Props) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { deleteContact, toggleActive, isPending } = useContactMutations();

  const handleEdit = () => router.push(`/contacts/${contactId}/edit`);

  const handleDelete = async () => {
    try {
      await deleteContact(contactId);
      router.push("/contacts");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleToggleActive = async () => {
    try {
      await toggleActive(contactId, !contact.active);
    } catch (error) {
      console.error("Toggle active error:", error);
    }
  };

  const primaryCompany = contact.companies.find((c) => c.isPrimaryContact);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/contacts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-base shrink-0 select-none">
              {getInitials(contact.firstName, contact.lastName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold leading-tight">
                  {contact.firstName} {contact.lastName}
                </h1>
                <Badge variant={contact.active ? "default" : "secondary"}>
                  {contact.active ? "Attivo" : "Inattivo"}
                </Badge>
              </div>
              {primaryCompany && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {primaryCompany.position && `${primaryCompany.position} · `}
                  {primaryCompany.company.companyName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Modifica
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleActive} disabled={isPending}>
                {contact.active ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Disattiva contatto
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Attiva contatto
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Elimina contatto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recapiti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.email && (
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={contact.email}
                  href={`mailto:${contact.email}`}
                />
              )}
              {contact.phone && (
                <InfoRow
                  icon={Phone}
                  label="Telefono"
                  value={contact.phone}
                  href={`tel:${contact.phone}`}
                />
              )}
              {contact.mobilePhone && (
                <InfoRow
                  icon={Smartphone}
                  label="Cellulare"
                  value={contact.mobilePhone}
                  href={`tel:${contact.mobilePhone}`}
                />
              )}
              {!contact.email && !contact.phone && !contact.mobilePhone && (
                <p className="text-sm text-muted-foreground">Nessun recapito inserito</p>
              )}
            </CardContent>
          </Card>

          {/* Company associations */}
          {contact.companies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Aziende associate{" "}
                  <span className="text-muted-foreground font-normal">
                    ({contact.companies.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.companies.map((entry, index) => (
                  <div key={entry.id}>
                    {index > 0 && <Separator className="mb-4" />}

                    <div className="flex items-start justify-between gap-3">
                      {/* Company identity */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {entry.company.companyName}
                            </span>
                            {entry.isPrimaryContact && (
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {entry.company.code}
                            {entry.company.tradeName && ` · ${entry.company.tradeName}`}
                          </p>
                        </div>
                      </div>

                      {/* Open company link */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        title="Apri scheda azienda"
                        onClick={() => router.push(`/companies/${entry.companyId}`)}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Role details */}
                    {(entry.position || entry.department) && (
                      <div className="mt-3 ml-12 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {entry.position && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">{entry.position}</span>
                          </div>
                        )}
                        {entry.department && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">{entry.department}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Company contact info */}
                    {(entry.company.mainEmail || entry.company.mainPhone) && (
                      <div className="mt-3 ml-12 space-y-1.5">
                        {entry.company.mainEmail && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <a
                              href={`mailto:${entry.company.mainEmail}`}
                              className="text-primary hover:underline truncate"
                            >
                              {entry.company.mainEmail}
                            </a>
                          </div>
                        )}
                        {entry.company.mainPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <a
                              href={`tel:${entry.company.mainPhone}`}
                              className="text-primary hover:underline"
                            >
                              {entry.company.mainPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Note</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {contact.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {contact.documents && contact.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Documenti associati{" "}
                  <span className="text-muted-foreground font-normal">
                    ({contact.documents.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contact.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{doc.documentType}</p>
                        {doc.documentNumber && (
                          <p className="text-xs text-muted-foreground">#{doc.documentNumber}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium tabular-nums">
                          €{doc.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.documentDate).toLocaleDateString("it-IT")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dettagli</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">ID Contatto</p>
                <p className="text-sm font-medium font-mono">#{contact.id}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Creato il</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-sm">{formatDateIT(contact.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ultimo aggiornamento</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-sm">{formatDateIT(contact.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Delete confirmation ───────────────────────────────────────────────── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare{" "}
              <strong>
                {contact.firstName} {contact.lastName}
              </strong>
              ? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
