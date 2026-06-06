// app/customers/[id]/page.tsx
// app/suppliers/[id]/page.tsx
"use client";

import { ArrowLeft, Edit, Trash2, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { useDeleteCustomer } from "@/hooks/use-company";
import { useDeleteSupplier } from "@/hooks/use-company";

import { CompanyDetailHeader } from "@/components/company/company-detail-header";
import { CompanyDetailTabs } from "@/components/company/company-detail-tabs";
import { BreadcrumbSetter } from "./ui/breadcrumb-setter";
import { CompanyType } from "@/types/company-types";
import { Customer, Supplier } from "@mini-erp/shared";
import { BreadcrumbItem } from "@/types/breadcrumb-types";
import { useCrumbMap } from "@/hooks/use-breadcrumb";
import { useNavigation } from "@/hooks/use-navigation";
import { useUpdateURL } from "@/hooks/use-update-url";

interface CompanyFormProps {
  data: Customer | Supplier;
  companyType: CompanyType;
}

export default function CompanyDetailPage({ data, companyType }: CompanyFormProps) {
  const { navigateToEdit, navigate, getNewRoute } = useNavigation();
  const updateURL = useUpdateURL();
  const navigationEntity = companyType === "CUSTOMER" ? "customers" : "suppliers";
  const crumbs = useCrumbMap();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const entityId = data.id;

  const breadcrumbItems: BreadcrumbItem[] = [
    companyType === "CUSTOMER" ? crumbs.customers : crumbs.suppliers,
    {
      label: data.company.companyName || "",
    },
  ];

  // Delete mutations
  const deleteCustomerMutation = useDeleteCustomer();
  const deleteSupplierMutation = useDeleteSupplier();

  const handleEdit = () => {
    navigateToEdit(navigationEntity, data.id);
  };

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

  const handleAddContact = () => {
    updateURL(getNewRoute("contacts"), { companyId: entityId });
  };

  const companyData = data;

  return (
    <div className="space-y-6">
      <BreadcrumbSetter items={breadcrumbItems} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              navigate(navigationEntity);
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{companyData?.company?.companyName}</h1>
            <p className="text-muted-foreground">
              {companyData?.company?.tradeName && `${companyData.company.tradeName} • `}
              {companyData?.company?.code}
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
