import { AddressType, Prisma } from "@/generated/prisma/client";
import { ConflictError, NotFoundError } from "@/utils/app-error-utils";
import { connectByCode, connectById } from "./prisma-helper";
import { resolveVersionAddressSnapshot } from "./address-helper";

// ============================================================================
// TYPES
// ============================================================================

/** Input parameters for a manual company historization. */
export interface StoricizeCompanyParams {
  /** CUID of the company to historize. */
  companyId: string;
  /** Tenant scope written into every CompanyVersion row. */
  tenantId: string;
  /** ID of the authenticated user who triggered the historization. */
  userId: string;
  /**
   * Effective date of the new version (validFrom of the new record /
   * validTo of the record being closed). Defaults to now() when omitted.
   */
  effectiveDate?: Date;
  /** Business reason for the historization. Required — validated in the shared schema (min 3 chars). */
  storicizeReason: string;
}

type CompanySnapshot = {
  companyId: string;
  tenantId: string;
  createdAt: Date;
  companyName: string;
  tradeName: string | null;
  legalForm: string | null;
  entityType: Prisma.CompanyVersionCreateInput["entityType"];
  vatNumber: string | null;
  taxCode: string | null;
  sdiCode: string | null;
  pec: string | null;
  eoriNumber: string | null;
  vatId: string | null;
  countryCode: string;
  mainEmail: string | null;
  mainPhone: string | null;
};

type VersionOverrides = {
  validFrom: Date;
  validTo?: Date;
  isCurrent: boolean;
  createdByUserId: string;
  storicizeReason: string;
};

type AddressSnap = Awaited<ReturnType<typeof resolveVersionAddressSnapshot>>;

/** Minimal company data needed to build the initial CompanyVersion snapshot. */
interface CompanyVersionSeedData {
  companyId: string;
  tenantId: string;
  userId: string;
  companyName: string;
  tradeName?: string | null;
  legalForm?: string | null;
  entityType?: Prisma.CompanyVersionCreateInput["entityType"];
  vatNumber?: string | null;
  taxCode?: string | null;
  sdiCode?: string | null;
  pec?: string | null;
  eoriNumber?: string | null;
  vatId?: string | null;
  countryCode: string;
  mainEmail?: string | null;
  mainPhone?: string | null;
}

// ============================================================================
// DATE OVERLAP GUARD
// ============================================================================

/**
 * Asserts that the proposed effective date does not conflict with existing versions.
 *
 * Checks performed:
 *  1. No existing version shares the same validFrom (@@unique([companyId, validFrom])).
 *  2. The effective date is strictly after the validFrom of the current version,
 *     preventing retroactive re-writes of already-closed periods.
 *
 * @param tx            - Open Prisma transaction client
 * @param companyId     - CUID of the company
 * @param effectiveDate - Proposed effective date
 * @throws ConflictError if the date is already taken or not strictly after the current version start
 */
export async function assertNonOverlappingVersion(
  tx: Prisma.TransactionClient,
  companyId: string,
  effectiveDate: Date,
): Promise<void> {
  const duplicate = await tx.companyVersion.findUnique({
    where: { companyId_validFrom: { companyId, validFrom: effectiveDate } },
    select: { id: true },
  });

  if (duplicate) {
    throw new ConflictError(
      `A version with effective date ${effectiveDate.toISOString().split("T")[0]} already exists for this company.`,
    );
  }

  const currentVersion = await tx.companyVersion.findFirst({
    where: { companyId, isCurrent: true },
    select: { validFrom: true },
  });

  if (currentVersion && effectiveDate <= currentVersion.validFrom) {
    throw new ConflictError(
      `Effective date must be after ${currentVersion.validFrom.toISOString().split("T")[0]}, ` +
        `which is the start date of the current active version.`,
    );
  }
}

// ============================================================================
// VERSION SNAPSHOT BUILDER
// ============================================================================

/**
 * Builds the Prisma create-data object for a CompanyVersion snapshot.
 * Extracts only the fields that belong to the CompanyVersion model;
 * all nullable Company fields are mapped to undefined (not null) so that
 * optional Prisma inputs are never set to an explicit null.
 *
 * @param company     - Company row loaded inside the transaction (pre-update state)
 * @param addrSnap    - Resolved billing/legal address snapshot
 * @param overrides   - Fields that differ from the Company row (validFrom, isCurrent, etc.)
 */
function buildVersionData(
  snap: CompanySnapshot,
  addrSnap: AddressSnap,
  overrides: VersionOverrides,
): Prisma.CompanyVersionCreateInput {
  return {
    company: connectById(snap.companyId),
    tenant: connectById(snap.tenantId),
    validFrom: overrides.validFrom,
    validTo: overrides.validTo,
    isCurrent: overrides.isCurrent,
    createdByUser: connectById(overrides.createdByUserId),
    storicizeReason: overrides.storicizeReason,
    // Anagraphic snapshot
    companyName: snap.companyName,
    tradeName: snap.tradeName ?? undefined,
    legalForm: snap.legalForm ?? undefined,
    entityType: snap.entityType,
    vatNumber: snap.vatNumber ?? undefined,
    taxCode: snap.taxCode ?? undefined,
    sdiCode: snap.sdiCode ?? undefined,
    pec: snap.pec ?? undefined,
    eoriNumber: snap.eoriNumber ?? undefined,
    vatId: snap.vatId ?? undefined,
    country: connectByCode(snap.countryCode),
    mainEmail: snap.mainEmail ?? undefined,
    mainPhone: snap.mainPhone ?? undefined,
    // Billing address snapshot
    ...addrSnap,
  };
}

// ============================================================================
// MAIN HISTORIZATION FUNCTION
// ============================================================================

/**
 * Executes the full company historization flow inside a caller-provided transaction.
 *
 * Atomic flow:
 *  1. Load the current Company row (pre-update snapshot).
 *  2. Assert the effective date does not overlap existing versions.
 *  3a. If a current version (isCurrent=true) already exists:
 *        UPDATE it → isCurrent=false, validTo=effectiveDate.
 *  3b. If no version exists yet (first historization):
 *        INSERT a genesis snapshot with validFrom=company.createdAt,
 *        validTo=effectiveDate, isCurrent=false.
 *  4.  INSERT new current CompanyVersion with validFrom=effectiveDate, isCurrent=true.
 *
 * Call this function BEFORE updating Company fields so that the snapshot
 * reflects the state that was in effect up to effectiveDate.
 * The caller must run `tx.company.update(...)` immediately after.
 *
 * @param tx     - Open Prisma transaction client (do NOT open a nested $transaction)
 * @param params - Historization parameters
 * @returns The newly created current CompanyVersion
 * @throws NotFoundError  if the company does not exist in the given tenant
 * @throws ConflictError  if the effective date conflicts with an existing version
 */
export async function storicizeCompany(
  tx: Prisma.TransactionClient,
  params: StoricizeCompanyParams,
): Promise<Prisma.CompanyVersionGetPayload<object>> {
  const { companyId, tenantId, userId, storicizeReason, effectiveDate: rawDate } = params;
  const effectiveDate = rawDate ?? new Date();

  const company = await tx.company.findFirst({
    where: { id: companyId, tenantId },
    select: {
      id: true,
      createdAt: true,
      companyName: true,
      tradeName: true,
      legalForm: true,
      entityType: true,
      vatNumber: true,
      taxCode: true,
      sdiCode: true,
      pec: true,
      eoriNumber: true,
      vatId: true,
      countryCode: true,
      mainEmail: true,
      mainPhone: true,
    },
  });

  if (!company) {
    throw new NotFoundError(`Company ${companyId} not found in tenant ${tenantId}.`);
  }

  await assertNonOverlappingVersion(tx, companyId, effectiveDate);

  const addrSnap = await resolveVersionAddressSnapshot(tx, companyId);

  const snap: CompanySnapshot = {
    companyId,
    tenantId,
    createdAt: company.createdAt,
    companyName: company.companyName,
    tradeName: company.tradeName,
    legalForm: company.legalForm,
    entityType: company.entityType,
    vatNumber: company.vatNumber,
    taxCode: company.taxCode,
    sdiCode: company.sdiCode,
    pec: company.pec,
    eoriNumber: company.eoriNumber,
    vatId: company.vatId,
    countryCode: company.countryCode,
    mainEmail: company.mainEmail,
    mainPhone: company.mainPhone,
  };

  const existingCurrent = await tx.companyVersion.findFirst({
    where: { companyId, isCurrent: true },
    select: { id: true },
  });

  if (existingCurrent) {
    await tx.companyVersion.update({
      where: { id: existingCurrent.id },
      data: { isCurrent: false, validTo: effectiveDate },
    });
  } else {
    await tx.companyVersion.create({
      data: buildVersionData(snap, addrSnap, {
        validFrom: company.createdAt,
        validTo: effectiveDate,
        isCurrent: false,
        createdByUserId: userId,
        storicizeReason: `[Auto-generated genesis snapshot] ${storicizeReason}`,
      }),
    });
  }

  return tx.companyVersion.create({
    data: buildVersionData(snap, addrSnap, {
      validFrom: effectiveDate,
      isCurrent: true,
      createdByUserId: userId,
      storicizeReason,
    }),
  });
}

/**
 * Syncs the current CompanyVersion snapshot with the latest company and address
 * data after an in-place update (i.e. when the user did NOT trigger a
 * historization). Only the open version (isCurrent = true, validTo = null)
 * is touched — closed versions are never modified.
 *
 * Must be called inside an open Prisma transaction, after both the company
 * row and any address upsert have been committed within the same transaction.
 *
 * @param tx        - Open Prisma transaction client
 * @param companyId - CUID of the updated company
 * @param userId    - ID of the authenticated user performing the update
 */
export async function syncCurrentVersion(
  tx: Prisma.TransactionClient,
  companyId: string,
  userId: string,
): Promise<void> {
  const company = await tx.company.findUnique({
    where: { id: companyId },
    select: {
      companyName: true,
      tradeName:   true,
      legalForm:   true,
      entityType:  true,
      vatNumber:   true,
      taxCode:     true,
      sdiCode:     true,
      pec:         true,
      eoriNumber:  true,
      vatId:       true,
      countryCode: true,
      mainEmail:   true,
      mainPhone:   true,
    },
  });

  if (!company) return;

  const current = await tx.companyVersion.findFirst({
    where: { companyId, isCurrent: true },
    select: { id: true },
  });

  if (!current) return;

  const addressSnap = await resolveVersionAddressSnapshot(tx, companyId);

  await tx.companyVersion.update({
    where: { id: current.id },
    data: {
      updatedByUserId: userId,
      companyName:     company.companyName,
      tradeName:       company.tradeName    ?? undefined,
      legalForm:       company.legalForm    ?? undefined,
      entityType:      company.entityType   ?? undefined,
      vatNumber:       company.vatNumber    ?? undefined,
      taxCode:         company.taxCode      ?? undefined,
      sdiCode:         company.sdiCode      ?? undefined,
      pec:             company.pec          ?? undefined,
      eoriNumber:      company.eoriNumber   ?? undefined,
      vatId:           company.vatId        ?? undefined,
      countryCode:     company.countryCode,
      mainEmail:       company.mainEmail    ?? undefined,
      mainPhone:       company.mainPhone    ?? undefined,
      address:         addressSnap.address  ?? undefined,
      city:            addressSnap.city     ?? undefined,
      provinceCode:    addressSnap.provinceCode ?? undefined,
      zipCode:         addressSnap.zipCode  ?? undefined,
    } satisfies Prisma.CompanyVersionUncheckedUpdateInput,
  });
}

/**
 * Creates the initial CompanyVersion record (isCurrent = true) for a newly
 * created company. Must be called inside an open Prisma transaction immediately
 * after the company row is created, so that address data is already available.
 *
 * This is not a user-triggered historization — it is the bootstrap snapshot
 * that seeds the version chain. The storicizeReason is therefore fixed.
 *
 * @param tx   - Open Prisma transaction client
 * @param data - Scalar fields from the newly created Company row
 */
export async function createInitialCompanyVersion(
  tx: Prisma.TransactionClient,
  data: CompanyVersionSeedData,
): Promise<void> {
  const now = new Date();
  const addressSnap = await resolveVersionAddressSnapshot(tx, data.companyId);

  await tx.companyVersion.create({
    data: {
      companyId: data.companyId,
      tenantId: data.tenantId,
      validFrom: now,
      validTo: undefined,
      isCurrent: true,
      storicizeReason: "Initial version",
      createdByUserId: data.userId,
      companyName: data.companyName,
      tradeName: data.tradeName ?? undefined,
      legalForm: data.legalForm ?? undefined,
      entityType: data.entityType ?? undefined,
      vatNumber: data.vatNumber ?? undefined,
      taxCode: data.taxCode ?? undefined,
      sdiCode: data.sdiCode ?? undefined,
      pec: data.pec ?? undefined,
      eoriNumber: data.eoriNumber ?? undefined,
      vatId: data.vatId ?? undefined,
      countryCode: data.countryCode,
      mainEmail: data.mainEmail ?? undefined,
      mainPhone: data.mainPhone ?? undefined,
      address: addressSnap.address ?? undefined,
      city: addressSnap.city ?? undefined,
      provinceCode: addressSnap.provinceCode ?? undefined,
      zipCode: addressSnap.zipCode ?? undefined,
    } satisfies Prisma.CompanyVersionUncheckedCreateInput,
  });
}
