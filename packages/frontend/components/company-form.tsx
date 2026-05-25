"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyFormData, CompanyType } from "@/types/company";
import { CompanyFormTabs } from "@/components/company/company-form-tab";
import {
  mapApiToForm,
  mapFormToCreateApi,
  extractCompanyData,
  extractCustomerData,
  extractSupplierData,
  mapFormToUpdateCompanyApi,
} from "@/lib/utils/company-mapper";
import {
  useCustomer,
  useSupplier,
  useCreateCustomer,
  useCreateSupplier,
  useUpdateCustomer,
  useUpdateSupplier,
} from "@/hooks/use-company";
import { CompanyStatus, CompanyTypeEntity, CreditCheckStatus, CustomerPriority, CustomerSegment, CustomerSize, CustomerType } from "@mini-erp/shared";

export default function CompanyFormPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  // Determina il tipo di entità dal path
  const companyType: CompanyType = pathname.includes("/customers") ? "CUSTOMER" : "SUPPLIER";

  const isEditMode = !!params?.id;
  const entityId = params?.id ? parseInt(params.id as string) : undefined;

  const [formData, setFormData] = useState<CompanyFormData>({
    // Company base
    companyName: "",
    tradeName: null,
    legalForm: null,
    entityType: CompanyTypeEntity.JURIDICAL,
    status: CompanyStatus.ACTIVE,
    vatNumber: "",
    taxCode: "",
    sdiCode: "",
    pec: null,
    eoriNumber: null,
    vatId: null,
    countryCode: "IT",
    mainEmail: null,
    mainPhone: null,
    assignedUserId: null,
    customFields: null,
    openingHours: null,

    // Legal address — sempre inizializzato per evitare uncontrolled inputs
    legalAddress: {
      address: "",
      city: "",
      provinceCode: "",
      zipCode: "",
      countryCode: "IT",
    },

    // Customer fields
    parentCustomerId: null,
    priority: CustomerPriority.MEDIUM,
    segment: CustomerSegment.STANDARD,
    size: CustomerSize.SMALL,
    type: CustomerType.CUSTOMER,
    creditStatus: CreditCheckStatus.PENDING,
    defaultPriceListId: null,
    customerTaxRuleId: null,
    paymentMethodId: null,

    // Supplier fields
    parentSupplierId: null,
    paymentTerms: null,
    bankAccount: null,
    leadTimeDays: 0,
    transportCost: null,
    rating: 5,

    // Presente su entrambi
    creditLimit: null,
  });

  // Fetch existing data usando gli hook specifici
  const { data: customerData, isLoading: isLoadingCustomer } = useCustomer(
    companyType === "CUSTOMER" ? entityId : undefined,
    isEditMode && companyType === "CUSTOMER",
  );

  const { data: supplierData, isLoading: isLoadingSupplier } = useSupplier(
    companyType === "SUPPLIER" ? entityId : undefined,
    isEditMode && companyType === "SUPPLIER",
  );

  const isLoading = isLoadingCustomer || isLoadingSupplier;

  // Popola il form quando i dati sono caricati
  useEffect(() => {
    if (isEditMode && !isLoading) {
      if (customerData?.data || supplierData?.data) {
        const mappedData =
          companyType === "CUSTOMER"
            ? mapApiToForm(customerData!.data, companyType)
            : mapApiToForm(supplierData!.data, companyType);
        setFormData(mappedData);
      }
    }
  }, [customerData, supplierData, isEditMode, isLoading, companyType]);

  // Hooks per le mutations
  const createCustomerMutation = useCreateCustomer();
  const createSupplierMutation = useCreateSupplier();
  const updateCustomerMutation = useUpdateCustomer(entityId || 0);
  const updateSupplierMutation = useUpdateSupplier(entityId || 0);

  const handleSubmit = async () => {
    if (companyType === "CUSTOMER") {
      if (isEditMode) {
        // UPDATE: usa mapFormToUpdateCompanyApi per i dati company
        updateCustomerMutation.mutate(
          {
            companyData: mapFormToUpdateCompanyApi(formData),
            customerData: extractCustomerData(formData),
          },
          {
            onSuccess: () => router.push(`/customers/${entityId}`),
          },
        );
      } else {
        // CREATE: payload completo con nested company + legalAddress
        createCustomerMutation.mutate(mapFormToCreateApi(formData, "CUSTOMER"), {
          onSuccess: (response) => {
            router.push(`/customers/${response.data?.id}`);
          },
        });
      }
    } else {
      if (isEditMode) {
        updateSupplierMutation.mutate(
          {
            companyData: mapFormToUpdateCompanyApi(formData),
            supplierData: extractSupplierData(formData),
          },
          {
            onSuccess: () => router.push(`/suppliers/${entityId}`),
          },
        );
      } else {
        createSupplierMutation.mutate(mapFormToCreateApi(formData, "SUPPLIER"), {
          onSuccess: (response) => {
            router.push(`/suppliers/${response.data?.id}`);
          },
        });
      }
    }
  };

  const isSaving =
    createCustomerMutation.isPending ||
    createSupplierMutation.isPending ||
    updateCustomerMutation.isPending ||
    updateSupplierMutation.isPending;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode
                ? `Modifica ${
                    companyType === "CUSTOMER" ? "Cliente" : "Fornitore"
                  } - ${formData.companyName}`
                : `Nuovo ${companyType === "CUSTOMER" ? "Cliente" : "Fornitore"}`}
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
          <Button onClick={handleSubmit} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Salvataggio..." : "Salva"}
          </Button>
        </div>
      </div>

      {/* Form Tabs */}
      <CompanyFormTabs formData={formData} setFormData={setFormData} companyType={companyType} />

      {/* Footer Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Salvataggio..." : isEditMode ? "Aggiorna" : "Crea"}
        </Button>
      </div>
    </div>
  );
}
