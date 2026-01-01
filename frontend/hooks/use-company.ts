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
} from "@/services/customer";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getDashboardStats as getSupplierStats,
} from "@/lib/client/modules/supplier";
import { Customer, CustomerQueryParams } from "@/types/customer";
import { Supplier, SupplierQueryParams } from "@/types/supplier";
import { CompanyType } from "@/types/company";
import { createAddress, updateAddress } from "@/lib/client/modules/address";
import { Address } from "@/types/address";
import {
  updateCustomerCompany,
  updateSupplierCompany,
} from "@/lib/client/modules/company";

// ============================================================================
// CUSTOMER HOOKS
// ============================================================================

/**
 * Hook per recuperare la lista dei clienti
 */
export function useCustomers(
  params: CustomerQueryParams = {
    page: 1,
    limit: 20,
  }
) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => getCustomers(params),
  });
}

/**
 * Hook per recuperare un cliente specifico
 */
export function useCustomer(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id!),
    enabled: enabled && !!id,
  });
}

/**
 * Hook per le statistiche dei clienti
 */
export function useCustomerStats() {
  return useQuery({
    queryKey: ["customer-stats"],
    queryFn: getCustomerStats,
  });
}

/**
 * Hook per creare un nuovo cliente
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<Customer> & { legalAddress?: Partial<Address> }
    ) => {
      // Estrai legalAddress dai dati
      const { legalAddress, ...customerData } = data;

      // Crea il cliente (con company nested)
      const customerResponse = await createCustomer(customerData);

      // Se c'è un indirizzo legale, crealo associato al nuovo cliente
      if (legalAddress && customerResponse.data?.id) {
        const newAddress = await createAddress(customerResponse.data.companyId, { // Nell'indirizzo metto l'id della company
          ...legalAddress,
          addressType: "LEGAL",
          isPrimary: true,
        });
        // Setta l'indirizzo legale appena creato nella company del fornitore
        await updateSupplierCompany(customerResponse.data.id, {
          legalAddressId: newAddress.data.id,
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
 * Hook per aggiornare un cliente (company + customer + address)
 */
export function useUpdateCustomer(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      companyData?: any;
      customerData?: any;
      legalAddress?: Partial<Address>;
      legalAddressId?: number;
    }) => {
      const { companyData, customerData, legalAddress, legalAddressId } = data;

      // 1. Aggiorna i dati della company (se presenti)
      if (companyData) {
        await updateCustomerCompany(id, companyData);
      }

      // 2. Aggiorna i dati specifici del customer (se presenti)
      let customerResponse;
      if (customerData) {
        customerResponse = await updateCustomer(id, customerData);
      }

      const companyId = companyData?.id || customerResponse?.data?.companyId;

      // 3. Gestisci l'indirizzo legale
      if (legalAddress && companyId) {
        if (legalAddressId) {
          // Aggiorna l'indirizzo esistente
          await updateAddress(legalAddressId, legalAddress);
        } else {
          // Crea un nuovo indirizzo
          const newAddress = await createAddress(companyId, {  // Nell'indirizzo metto l'id della company
            ...legalAddress,
            addressType: "LEGAL",
            isPrimary: true
          });
          // Setta l'indirizzo legale appena creato nella company del fornitore
          await updateSupplierCompany(id, {
            legalAddressId: newAddress.data.id,
          });
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
 * Hook per eliminare un cliente
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
 * Hook per recuperare la lista dei fornitori
 */
export function useSuppliers(params: SupplierQueryParams = { page: 1 }) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => getSuppliers(params),
  });
}

/**
 * Hook per recuperare un fornitore specifico
 */
export function useSupplier(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => getSupplierById(id!),
    enabled: enabled && !!id,
  });
}

/**
 * Hook per le statistiche dei fornitori
 */
export function useSupplierStats() {
  return useQuery({
    queryKey: ["supplier-stats"],
    queryFn: getSupplierStats,
  });
}

/**
 * Hook per creare un nuovo fornitore
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<Supplier> & { legalAddress?: Partial<Address> }
    ) => {
      // Estrai legalAddress dai dati
      const { legalAddress, ...supplierData } = data;

      // Crea il fornitore (con company nested)
      const supplierResponse = await createSupplier(supplierData);

      // Se c'è un indirizzo legale, crealo associato al nuovo fornitore
      if (legalAddress && supplierResponse.data?.id) {
        const newAddress = await createAddress(supplierResponse.data.companyId, {
          ...legalAddress,
          addressType: "LEGAL",
          isPrimary: true
        });
        // Setta l'indirizzo legale appena creato nella company del fornitore
        await updateSupplierCompany(supplierResponse.data.id, {
          legalAddressId: newAddress.data.id,
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
 * Hook per aggiornare un fornitore (company + supplier + address)
 */
export function useUpdateSupplier(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      companyData?: any;
      supplierData?: any;
      legalAddress?: Partial<Address>;
      legalAddressId?: number;
    }) => {
      const { companyData, supplierData, legalAddress, legalAddressId } = data;

      // 1. Aggiorna i dati della company (se presenti)
      if (companyData) {
        await updateSupplierCompany(id, companyData);
      }

      // 2. Aggiorna i dati specifici del supplier (se presenti)
      let supplierResponse;
      if (supplierData) {
        supplierResponse = await updateSupplier(id, supplierData);
      }

      const companyId = companyData?.id || supplierResponse?.data?.companyId;

      // 3. Gestisci l'indirizzo legale
      if (legalAddress && companyId) {
        if (legalAddressId) {
          // Aggiorna l'indirizzo esistente
          await updateAddress(legalAddressId, legalAddress);
        } else {
          // Crea un nuovo indirizzo
          const newAddress = await createAddress(companyId, {
            ...legalAddress,
            addressType: "LEGAL",
            isPrimary: true,
          });
          // Setta l'indirizzo legale appena creato nella company del fornitore
          await updateSupplierCompany(id, {
            legalAddressId: newAddress.data.id,
          });
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
 * Hook per eliminare un fornitore
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
 * Hook generico per recuperare un'entità (customer o supplier)
 */
export function useCompanyEntity(
  type: CompanyType,
  id: number | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: [type, id],
    queryFn: async () => {
      if (!id) return null;

      const response =
        type === "CUSTOMER"
          ? await getCustomerById(id)
          : await getSupplierById(id);

      return response.data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Hook generico per la lista di entità
 */
export function useCompanyEntities(
  type: CompanyType,
  params: CustomerQueryParams | SupplierQueryParams = {}
) {
  return useQuery({
    queryKey: [type + "s", params],
    queryFn: async () => {
      const response =
        type === "CUSTOMER"
          ? await getCustomers(params as CustomerQueryParams)
          : await getSuppliers(params as SupplierQueryParams);

      return response.data;
    },
  });
}
