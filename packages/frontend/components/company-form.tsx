// packages/frontend/components/company-form.tsx
"use client";

import { useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
  companyFormSchema,
  companyFormDefaultValues,
  CompanyFormValues,
  CompanyFormInput,
  Customer,
  Supplier,
} from "@mini-erp/shared";
import { Button } from "@/components/ui/button";
import { CompanyFormTabs } from "@/components/company/company-form-tab";
import { CompanyType } from "@/types/company-types";
import {
  mapApiToForm,
  mapFormToCreateApi,
  extractCustomerData,
  extractSupplierData,
  mapFormToUpdateCompanyApi,
} from "@/lib/utils/company-mapper";
import {
  createCustomerAction,
  updateCustomerAction,
  updateCustomerCompanyAction,
} from "@/actions/customer-actions";
import {
  createSupplierAction,
  updateSupplierAction,
  updateSupplierCompanyAction,
} from "@/actions/supplier-actions";
import { useNavigation } from "@/hooks/use-navigation";

interface CompanyFormProps {
  initialData?: Customer | Supplier;
  companyType: CompanyType;
}

export default function CompanyFormPage({ initialData, companyType }: CompanyFormProps) {
  const { navigateToDetail, navigate } = useNavigation();
  const entityType = companyType === "CUSTOMER" ? "customers" : "suppliers";

  const isEditMode = !!initialData;
  const entityId = initialData ? (initialData as { id: string }).id : undefined;

  const [isPending, startTransition] = useTransition();

  const form = useForm<CompanyFormInput>({
    resolver: standardSchemaResolver(companyFormSchema),
    defaultValues: initialData
      ? companyType === "CUSTOMER"
        ? mapApiToForm(initialData as Customer, "CUSTOMER")
        : mapApiToForm(initialData as Supplier, "SUPPLIER")
      : companyFormDefaultValues,
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(
    (data) => {
      const values = data as CompanyFormValues;
      startTransition(async () => {
        if (companyType === "CUSTOMER") {
          if (isEditMode && entityId) {
            const [companyRes, customerRes] = await Promise.all([
              updateCustomerCompanyAction(entityId, mapFormToUpdateCompanyApi(values)),
              updateCustomerAction(entityId, extractCustomerData(values)),
            ]);
            if (!companyRes.success || !customerRes.success) {
              toast.error(companyRes.error ?? customerRes.error ?? "Errore nell'aggiornamento");
              return;
            }
            toast.success("Cliente aggiornato con successo");
            navigateToDetail("customers", entityId);
          } else {
            const result = await createCustomerAction(mapFormToCreateApi(values, "CUSTOMER"));
            if (!result.data) {
              toast.error(result.error ?? "Errore nella creazione");
              return;
            }
            toast.success("Cliente creato con successo");
            navigateToDetail("customers", result.data.id);
          }
        } else {
          if (isEditMode && entityId) {
            const [companyRes, supplierRes] = await Promise.all([
              updateSupplierCompanyAction(entityId, mapFormToUpdateCompanyApi(values)),
              updateSupplierAction(entityId, extractSupplierData(values)),
            ]);
            if (!companyRes.success || !supplierRes.success) {
              toast.error(companyRes.error ?? supplierRes.error ?? "Errore nell'aggiornamento");
              return;
            }
            toast.success("Fornitore aggiornato con successo");
            navigateToDetail("suppliers", entityId);
          } else {
            const result = await createSupplierAction(mapFormToCreateApi(values, "SUPPLIER"));
            if (!result.data) {
              toast.error(result.error ?? "Errore nella creazione");
              return;
            }
            toast.success("Fornitore creato con successo");
            navigateToDetail("suppliers", result.data.id);
          }
        }
      });
    },
    (errors) => {
      // Questo callback viene chiamato quando la validazione fallisce
      console.log("🔴 Submit blocked by errors:", errors);
    },
  );

  return (
    <FormProvider {...form}>
      <div className="space-y-6">      
        <CompanyFormTabs companyType={companyType} />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(entityType)}>
            Annulla
          </Button>
          <Button onClick={onSubmit} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Salvataggio..." : isEditMode ? "Aggiorna" : "Crea"}
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
