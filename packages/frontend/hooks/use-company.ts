// hooks/use-company.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDashboardStats as getCustomerStats,
  getCompanies,
} from "@/services/client/company";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getDashboardStats as getSupplierStats,
} from "@/lib/client/modules/supplier";
import { updateCustomerCompany, updateSupplierCompany } from "@/lib/client/modules/company";
import { createAddress, updateAddress, getAddressByType } from "@/lib/client/modules/address";
import type { CustomerQueryInput } from "@/types/customer-types";
import type { SupplierQueryInput } from "@/types/supplier-types";
import type { CompanyQueryInput } from "@/types/company";
import { CreateCustomerInput } from "@mini-erp/shared/types";
import { AddressTypeEnum } from "@mini-erp/shared/constants";

// ============================================================================
// COMPANY HOOKS
// ============================================================================

/**
 * Fetches the paginated list of companies (base registry, no customer/supplier data).
 */
export function useCompanies(
  params: CompanyQueryInput = {
    page: 1,
    limit: 20,
    sortOrder: "asc",
    sortBy: "companyName",
  },
) {
  return useQuery({
    queryKey: ["companies", params],
    queryFn: () => getCompanies(params),
  });
}

// ============================================================================
// CUSTOMER HOOKS
// ============================================================================

/**
 * Fetches the paginated list of customers.
 */
export function useCustomers(
  params: CustomerQueryInput = {
    page: 1,
    limit: 20,
    sortBy: "companyName",
    sortOrder: "asc",
  },
) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => getCustomers(params),
  });
}

/**
 * Fetches a single customer by ID.
 */
export function useCustomer(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id!),
    enabled: enabled && !!id,
  });
}

/**
 * Fetches customer dashboard statistics.
 */
export function useCustomerStats() {
  return useQuery({
    queryKey: ["customer-stats"],
    queryFn: getCustomerStats,
  });
}

/**
 * Creates a new customer with its company and legal address in a single flow.
 * The legal address is created as a separate API call after the customer is created,
 * since addresses are managed via their own endpoint.
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerInput) => {
      const { company, ...customerData } = data;
      const { legalAddress, ...companyData } = company;

      // 1. Crea il customer con la company nested
      const customerResponse = await createCustomer({
        company: companyData,
        ...customerData,
      });

      const companyId = customerResponse.data?.company?.id;

      // 2. Se presente, crea l'indirizzo legale associato alla company
      if (legalAddress && companyId) {
        await createAddress(companyId, {
          ...legalAddress,
          addressType: AddressTypeEnum.LEGAL,
          isPrimary: true,
        });
      }

      return customerResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente creato con successo");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Errore nella creazione");
    },
  });
}

/**
 * Updates an existing customer.
 * Company data and legal address are updated via dedicated endpoints.
 * The legal address is upserted: updated if it exists, created otherwise.
 */
export function useUpdateCustomer(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      companyData?: CompanyUpdateInput;
      customerData?: CustomerUpdateInput;
    }) => {
      const { companyData, customerData } = data;
      const { legalAddress, ...companyFields } = companyData ?? {};

      // Esegue le chiamate in parallelo dove possibile
      const [customerResponse] = await Promise.all([
        customerData ? updateCustomer(id, customerData) : Promise.resolve(null),
        Object.keys(companyFields).length > 0
          ? updateCustomerCompany(id, companyFields)
          : Promise.resolve(null),
      ]);

      // Gestione indirizzo legale — upsert tramite API dedicata
      if (legalAddress) {
        const companyId = companyData?.companyId ?? customerResponse?.data?.companyId;

        if (companyId) {
          // Cerca l'indirizzo legale esistente
          const existing = await getAddressByType(companyId, AddressTypeEnum.LEGAL);

          if (existing?.data?.id) {
            // Aggiorna il legale esistente
            await updateAddress(existing.data.id, legalAddress);
          } else {
            // Crea il legale se non esiste ancora
            await createAddress(companyId, {
              ...legalAddress,
              addressType: AddressTypeEnum.LEGAL,
              isPrimary: true,
            });
          }
        }
      }

      return customerResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente aggiornato con successo");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Errore nell'aggiornamento");
    },
  });
}

/**
 * Soft-deletes a customer by ID.
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente eliminato con successo");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Errore nell'eliminazione");
    },
  });
}

// ============================================================================
// SUPPLIER HOOKS
// ============================================================================

/**
 * Fetches the paginated list of suppliers.
 */
export function useSuppliers(
  params: SupplierQueryInput = {
    page: 1,
    limit: 20,
    sortBy: "companyName",
    sortOrder: "asc",
  },
) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => getSuppliers(params),
  });
}

/**
 * Fetches a single supplier by ID.
 */
export function useSupplier(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => getSupplierById(id!),
    enabled: enabled && !!id,
  });
}

/**
 * Fetches supplier dashboard statistics.
 */
export function useSupplierStats() {
  return useQuery({
    queryKey: ["supplier-stats"],
    queryFn: getSupplierStats,
  });
}

/**
 * Creates a new supplier with its company and legal address in a single flow.
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SupplierCreateInput) => {
      const { company, ...supplierData } = data;
      const { legalAddress, ...companyData } = company;

      // 1. Crea il supplier con la company nested
      const supplierResponse = await createSupplier({
        company: companyData,
        ...supplierData,
      });

      const companyId = supplierResponse.data?.company?.id;

      // 2. Se presente, crea l'indirizzo legale
      if (legalAddress && companyId) {
        await createAddress(companyId, {
          ...legalAddress,
          addressType: AddressTypeEnum.LEGAL,
          isPrimary: true,
        });
      }

      return supplierResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornitore creato con successo");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Errore nella creazione");
    },
  });
}

/**
 * Updates an existing supplier.
 * Company data and legal address are updated via dedicated endpoints.
 */
export function useUpdateSupplier(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      companyData?: CompanyUpdateInput;
      supplierData?: SupplierUpdateInput;
    }) => {
      const { companyData, supplierData } = data;
      const { legalAddress, ...companyFields } = companyData ?? {};

      const [supplierResponse] = await Promise.all([
        supplierData ? updateSupplier(id, supplierData) : Promise.resolve(null),
        Object.keys(companyFields).length > 0
          ? updateSupplierCompany(id, companyFields)
          : Promise.resolve(null),
      ]);

      if (legalAddress) {
        const companyId = companyData?.companyId ?? supplierResponse?.data?.companyId;

        if (companyId) {
          const existing = await getAddressByType(companyId, AddressTypeEnum.LEGAL);

          if (existing?.data?.id) {
            await updateAddress(existing.data.id, legalAddress);
          } else {
            await createAddress(companyId, {
              ...legalAddress,
              addressType: AddressTypeEnum.LEGAL,
              isPrimary: true,
            });
          }
        }
      }

      return supplierResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier", id] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornitore aggiornato con successo");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Errore nell'aggiornamento");
    },
  });
}

/**
 * Soft-deletes a supplier by ID.
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornitore eliminato con successo");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Errore nell'eliminazione");
    },
  });
}

// ============================================================================
// GENERIC HOOKS (for reusable components)
// ============================================================================

/**
 * Generic hook to fetch a single entity (customer or supplier) by type and ID.
 */
export function useCompanyEntity(
  type: "CUSTOMER" | "SUPPLIER",
  id: number | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: [type.toLowerCase(), id],
    queryFn: async () => {
      if (!id) return null;
      const response = type === "CUSTOMER" ? await getCustomerById(id) : await getSupplierById(id);
      return response.data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Generic hook to fetch the paginated list of entities (customers or suppliers).
 */
export function useCompanyEntities(
  type: "CUSTOMER" | "SUPPLIER",
  params: CustomerQueryInput | SupplierQueryInput,
) {
  return useQuery({
    queryKey: [type.toLowerCase() + "s", params],
    queryFn: async () => {
      const response =
        type === "CUSTOMER"
          ? await getCustomers(params as CustomerQueryInput)
          : await getSuppliers(params as SupplierQueryInput);
      return response.data;
    },
  });
}
