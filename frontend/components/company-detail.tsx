// app/customers/[id]/page.tsx
// app/suppliers/[id]/page.tsx
"use client";

import { useRouter, useParams, usePathname } from "next/navigation";
import { ArrowLeft, Edit, Trash2, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import { useState } from "react";
import { useCustomer, useDeleteCustomer } from "@/hooks/use-company";
import { useSupplier, useDeleteSupplier } from "@/hooks/use-company";
import { CompanyType } from "@/types/company";
import { CompanyDetailHeader } from "@/components/company/company-detail-header";
import { CompanyDetailTabs } from "@/components/company/company-detail-tabs";

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Determina il tipo dal path
  const companyType: CompanyType = pathname.includes("/customers")
    ? "CUSTOMER"
    : "SUPPLIER";
  
  const entityId = parseInt(params.id as string);

  // Fetch data basato sul tipo
  const customerQuery = useCustomer(entityId, companyType === "CUSTOMER");
  const supplierQuery = useSupplier(entityId, companyType === "SUPPLIER");
  
  const { data, isLoading, error } = companyType === "CUSTOMER" 
    ? customerQuery 
    : supplierQuery;

  // Delete mutations
  const deleteCustomerMutation = useDeleteCustomer();
  const deleteSupplierMutation = useDeleteSupplier();

  const handleEdit = () => {
    const path = companyType === "CUSTOMER" ? "customers" : "suppliers";
    router.push(`/${path}/${entityId}/edit`);
  };

  const handleDelete = async () => {
    try {
      if (companyType === "CUSTOMER") {
        await deleteCustomerMutation.mutateAsync(entityId);
      } else {
        await deleteSupplierMutation.mutateAsync(entityId);
      }
      const path = companyType === "CUSTOMER" ? "customers" : "suppliers";
      router.push(`/${path}`);
    } catch (error: any) {
      // Error già gestito nel mutation
    }
  };

  const handleAddContact = () => {
    router.push(`/contacts/new?companyId=${entityId}`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg text-muted-foreground mb-4">
          Errore nel caricamento dei dati
        </p>
        <Button onClick={() => router.back()}>Torna indietro</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg text-muted-foreground mb-4">
          {companyType === "CUSTOMER" ? "Cliente" : "Fornitore"} non trovato
        </p>
        <Button onClick={() => router.back()}>Torna indietro</Button>
      </div>
    );
  }

  const companyData = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const path = companyType === "CUSTOMER" ? "customers" : "suppliers";
              router.push(`/${path}`);
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{companyData?.companyName}</h1>
            <p className="text-muted-foreground">
              {companyData?.tradeName && `${companyData.tradeName} • `}
              {companyData?.code}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddContact}>
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Contatto
          </Button>
          
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddContact}>
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Contatto
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats Header */}
      <CompanyDetailHeader data={companyData} companyType={companyType} />

      {/* Tabs Content */}
      <CompanyDetailTabs data={companyData} companyType={companyType} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare{" "}
              <strong>{companyData?.companyName}</strong>? Questa azione non può essere
              annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCustomerMutation.isPending || deleteSupplierMutation.isPending
                ? "Eliminazione..."
                : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}