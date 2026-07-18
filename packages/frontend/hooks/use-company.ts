// hooks/use-company.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCustomers,
  getCustomerById,
  deleteCustomer,
  getDashboardStats as getCustomerStats,
  getCompanies,
} from "@/services/client/company";
import {
  getSuppliers,
  getSupplierById,
  deleteSupplier,
  getDashboardStats as getSupplierStats,
} from "@/lib/client/modules/supplier";
import type { CustomerQueryInput } from "@/types/customer-types";
import type { SupplierQueryInput } from "@/types/supplier-types";
import { CompanyQueryInput } from "@mini-erp/shared";

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
    type: undefined,
    priority: undefined,
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
export function useCustomer(id: string | undefined, enabled = true) {
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
 * Soft-deletes a customer by ID.
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
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
    minRating: undefined,
    maxRating: undefined,
    maxLeadTime: undefined,
    minLeadTime: undefined,
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
export function useSupplier(id: string | undefined, enabled = true) {
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
 * Soft-deletes a supplier by ID.
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
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
  id: string | undefined,
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
