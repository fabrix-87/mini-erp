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
} from "@/lib/utils/company-mapper";
import {
  useCustomer,
  useSupplier,
  useCreateCustomer,
  useCreateSupplier,
  useUpdateCustomer,
  useUpdateSupplier,
} from "@/hooks/use-company";

export default function CompanyFormPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  // Determina il tipo di entità dal path
  const companyType: CompanyType = pathname.includes("/customers")
    ? "CUSTOMER"
    : "SUPPLIER";

  const isEditMode = !!params?.id;
  const entityId = params?.id ? parseInt(params.id as string) : undefined;

  const [formData, setFormData] = useState<CompanyFormData>({
    // Company base
    companyName: "",
    tradeName: "",
    legalForm: "",
    entityType: "JURIDICAL",
    status: "ACTIVE",

    // Fiscal data
    vatNumber: "",
    taxCode: "",
    sdiCode: "",
    pec: "",
    eoriNumber: "",
    vatId: "",
    countryCode: "IT",

    // Contact info
    mainEmail: "",
    mainPhone: "",

    // Legal address
    legalAddress: {
      address: "",
      city: "",
      provinceCode: "",
      zipCode: "",
      countryCode: "IT",
    },

    // Customer specific
    ...(companyType === "CUSTOMER" && {
      priority: "MEDIUM",
      segment: "STANDARD",
      leadStatus: "NEW",
      size: "SMALL",
      type: "LEAD",
      creditStatus: "PENDING",
    }),

    // Supplier specific
    ...(companyType === "SUPPLIER" && {
      paymentTerms: "",
      leadTimeDays: 0,
      rating: 5,
    }),

    creditLimit: 0,
  });

  // Fetch existing data usando gli hook specifici
  const { data: customerData, isLoading: isLoadingCustomer } = useCustomer(
    companyType === "CUSTOMER" ? entityId : undefined,
    isEditMode && companyType === "CUSTOMER"
  );

  const { data: supplierData, isLoading: isLoadingSupplier } = useSupplier(
    companyType === "SUPPLIER" ? entityId : undefined,
    isEditMode && companyType === "SUPPLIER"
  );

  const isLoading = isLoadingCustomer || isLoadingSupplier;

  // Popola il form quando i dati sono caricati
  useEffect(() => {
    if (isEditMode && !isLoading) {
      const data =
        companyType === "CUSTOMER" ? customerData?.data : supplierData?.data;
      if (data) {
        const mappedData = mapApiToForm(data, companyType);
        setFormData(mappedData);
      }
    }
  }, [customerData, supplierData, isEditMode, isLoading, companyType]);

  // Hooks per le mutations
  const createCustomerMutation = useCreateCustomer();
  const createSupplierMutation = useCreateSupplier();
  const updateCustomerMutation = useUpdateCustomer(entityId || 0);
  const updateSupplierMutation = useUpdateSupplier(entityId || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (companyType === "CUSTOMER") {
      if (isEditMode) {
        // UPDATE: separa i dati
        const {legalAddressId, ...companyData} = extractCompanyData(formData);
        const customerData = extractCustomerData(formData);

        updateCustomerMutation.mutate(
          {
            companyData,
            customerData,
            legalAddress: formData.legalAddress,
            legalAddressId,
          },
          {
            onSuccess: () => {
              router.push(`/customers/${entityId}`);
            },
          }
        );
      } else {
        // CREATE: usa company nested
        const apiData = mapFormToCreateApi(formData, companyType);

        createCustomerMutation.mutate(
          { ...apiData, legalAddress: formData.legalAddress },
          {
            onSuccess: (response) => {
              router.push(`/customers/${response.data?.id}`);
            },
          }
        );
      }
    } else {
      if (isEditMode) {
        // UPDATE: separa i dati
        const {legalAddressId, ...companyData} = extractCompanyData(formData);
        const supplierData = extractSupplierData(formData);

        updateSupplierMutation.mutate(
          {
            companyData,
            supplierData,
            legalAddress: formData.legalAddress,
            legalAddressId,
          },
          {
            onSuccess: () => {
              router.push(`/suppliers/${entityId}`);
            },
          }
        );
      } else {
        // CREATE: usa company nested
        const apiData = mapFormToCreateApi(formData, companyType);

        createSupplierMutation.mutate(
          { ...apiData, legalAddress: formData.legalAddress },
          {
            onSuccess: (response) => {
              router.push(`/suppliers/${response.data?.id}`);
            },
          }
        );
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
                : `Nuovo ${
                    companyType === "CUSTOMER" ? "Cliente" : "Fornitore"
                  }`}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Aggiorna le informazioni"
                : "Crea una nuova anagrafica"}
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
      <CompanyFormTabs
        formData={formData}
        setFormData={setFormData}
        companyType={companyType}
      />

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
