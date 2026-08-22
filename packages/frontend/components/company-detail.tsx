// app/customers/[id]/page.tsx
// app/suppliers/[id]/page.tsx
"use client";

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
import { useState } from "react";
import { useDeleteCustomer } from "@/hooks/use-company";
import { useDeleteSupplier } from "@/hooks/use-company";

import { CompanyDetailHeader } from "@/components/company/company-detail-header";
import { CompanyDetailTabs } from "@/components/company/company-detail-tabs";
import { CompanyType } from "@/types/company-types";
import { Customer, Supplier } from "@mini-erp/shared";
import { useNavigation } from "@/hooks/use-navigation";

interface CompanyFormProps {
  data: Customer | Supplier;
  companyType: CompanyType;
}

export default function CompanyDetailPage({ data, companyType }: CompanyFormProps) {
  const { navigate} = useNavigation();
  const navigationEntity = companyType === "CUSTOMER" ? "customers" : "suppliers";

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const entityId = data.id;


  // Delete mutations
  const deleteCustomerMutation = useDeleteCustomer();
  const deleteSupplierMutation = useDeleteSupplier();

  const handleDelete = async () => {
    try {
      if (companyType === "CUSTOMER") {
        await deleteCustomerMutation.mutateAsync(entityId);
      } else {
        await deleteSupplierMutation.mutateAsync(entityId);
      }
      navigate(navigationEntity);
    } catch (error: any) {
      // Error già gestito nel mutation
    }
  };

  const companyData = data;

  return (
    <div className="space-y-6">
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
              Sei sicuro di voler eliminare <strong>{companyData.company?.companyName}</strong>?
              Questa azione non può essere annullata.
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
