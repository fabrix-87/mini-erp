// packages/frontend/components/company-form.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ArrowLeft, Save } from "lucide-react";
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

interface CompanyFormProps {
  initialData?: Customer | Supplier;
  companyType: CompanyType;
}

export default function CompanyFormPage({ initialData, companyType }: CompanyFormProps) {
  const router = useRouter();

  const isEditMode = !!initialData;
  const entityId = initialData ? (initialData as { id: number }).id : undefined;

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
            router.push(`/customers/${entityId}`);
          } else {
            const result = await createCustomerAction(mapFormToCreateApi(values, "CUSTOMER"));
            if (!result.success) {
              toast.error(result.error ?? "Errore nella creazione");
              return;
            }
            toast.success("Cliente creato con successo");
            router.push(`/customers/${result.data?.id}`);
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
            router.push(`/suppliers/${entityId}`);
          } else {
            const result = await createSupplierAction(mapFormToCreateApi(values, "SUPPLIER"));
            if (!result.success) {
              toast.error(result.error ?? "Errore nella creazione");
              return;
            }
            toast.success("Fornitore creato con successo");
            router.push(`/suppliers/${result.data?.id}`);
          }
        }
      });
    },
    (errors) => {
      // Questo callback viene chiamato quando la validazione fallisce
      console.log("🔴 Submit blocked by errors:", errors);
    },
  );

  const entityLabel = companyType === "CUSTOMER" ? "Cliente" : "Fornitore";

  return (
    <FormProvider {...form}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditMode
                  ? `Modifica ${entityLabel} — ${form.watch("companyName") || "..."}`
                  : `Nuovo ${entityLabel}`}
              </h1>
              <p className="text-muted-foreground">
                {isEditMode ? "Aggiorna le informazioni" : "Crea una nuova anagrafica"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Annulla
            </Button>
            <Button onClick={onSubmit} disabled={isPending}>
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Salvataggio..." : isEditMode ? "Aggiorna" : "Crea"}
            </Button>
          </div>
        </div>

        <CompanyFormTabs companyType={companyType} />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
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
