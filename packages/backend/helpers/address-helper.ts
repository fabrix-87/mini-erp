import { AddressType, Prisma } from "@/generated/prisma/client";
import { buildAddressCreateData } from "@/services/company/company";
import { CreateNestedAddressInput } from "@mini-erp/shared";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Minimal shape required to upsert any address via this helper.
 * Mirrors CreateNestedAddressInput from @mini-erp/shared.
 */
export type AddressUpsertInput = CreateNestedAddressInput;

// ============================================================================
// UPSERT HELPERS
// ============================================================================

/**
 * Upserts a LEGAL address for the given company inside an open transaction.
 *
 * The LEGAL address is unique per company (partial unique index on
 * `address_type = 'LEGAL'`). Creates a new record if none exists,
 * otherwise updates the existing one. Always sets isPrimary = true.
 *
 * @param tx        - Open Prisma transaction client
 * @param companyId - CUID of the owning company
 * @param input     - Address fields from the request body
 */
export async function upsertLegalAddress(
  tx: Prisma.TransactionClient,
  companyId: string,
  input: AddressUpsertInput,
): Promise<void> {
  const data = buildAddressCreateData(input, {
    addressType: AddressType.LEGAL,
    isPrimary: true,
  });

  const existing = await tx.companyAddress.findFirst({
    where: { companyId, addressType: AddressType.LEGAL },
    select: { id: true },
  });

  if (existing) {
    await tx.companyAddress.update({ where: { id: existing.id }, data });
  } else {
    await tx.companyAddress.create({ data: { ...data, companyId } });
  }
}

/**
 * Upserts an address of any type for the given company inside an open transaction.
 *
 * For types that allow multiple records (BILLING, SHIPPING, etc.) the lookup
 * uses `isPrimary = true` to identify the record to update; a new primary
 * record is created when none is found. For types constrained to a single
 * record per company (LEGAL) prefer `upsertLegalAddress` which is stricter.
 *
 * @param tx        - Open Prisma transaction client
 * @param companyId - CUID of the owning company
 * @param input     - Address fields including addressType from the request body
 */
export async function upsertAddress(
  tx: Prisma.TransactionClient,
  companyId: string,
  input: AddressUpsertInput,
): Promise<void> {
  const data = buildAddressCreateData(input);

  const existing = await tx.companyAddress.findFirst({
    where: { companyId, addressType: input.addressType, isPrimary: true },
    select: { id: true },
  });

  if (existing) {
    await tx.companyAddress.update({ where: { id: existing.id }, data });
  } else {
    await tx.companyAddress.create({ data: { ...data, companyId } });
  }
}

// ============================================================================
// SNAPSHOT RESOLVER
// ============================================================================

/**
 * Resolves the address fields to embed in a CompanyVersion snapshot.
 *
 * Priority order: BILLING → LEGAL. Within the same type, the primary
 * address is preferred. Returns all fields as undefined when no matching
 * address exists (the version row is still valid — address fields are optional).
 *
 * @param tx        - Open Prisma transaction client
 * @param companyId - CUID of the company
 */
export async function resolveVersionAddressSnapshot(
  tx: Prisma.TransactionClient,
  companyId: string,
): Promise<{
  address?: string;
  city?: string;
  provinceCode?: string;
  zipCode?: string;
}> {
  const addr = await tx.companyAddress.findFirst({
    where: {
      companyId,
      addressType: { in: [AddressType.BILLING, AddressType.LEGAL] },
    },
    orderBy: [{ addressType: "asc" }, { isPrimary: "desc" }],
    select: { address: true, city: true, provinceCode: true, zipCode: true },
  });

  return {
    address: addr?.address ?? undefined,
    city: addr?.city ?? undefined,
    provinceCode: addr?.provinceCode ?? undefined,
    zipCode: addr?.zipCode ?? undefined,
  };
}
