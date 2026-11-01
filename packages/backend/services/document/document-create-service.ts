import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { ConflictError, ValidationError } from "@/utils/app-error-utils";
import { buildDocumentCreateData } from "./document-create-builder";
import {
  TRANSACTION_LIMITS_OPTIONS,
  type DocumentCreateContext,
  type DocumentLinePricingContext,
} from "@/types";
import { CreateDocumentInput, IDEMPOTENCY_KEY_TTL_MS } from "@mini-erp/shared";
import { resolveDocumentLinePricing } from "./document-line-pricing-service";
import { acquireIdempotencyLock } from "./document-idempotency";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import { resolveDocumentLinesTax } from "./document-line-tax-service";

/** Shape returned by the document creation service. */
export type CreatedDocument = Prisma.DocumentGetPayload<{ include: { lines: true } }>;

/** Idempotency data of a creation request. */
export interface DocumentIdempotency {
  /** Client-provided idempotency key. */
  key: string;
  /** SHA-256 fingerprint of the raw request body. */
  requestHash: string;
}

/** Result of a creation request. */
export interface CreateDocumentResult {
  /** The created document, or the original one when the request is a replay. */
  document: CreatedDocument;
  /** True when the key had already been used and no new document was created. */
  replayed: boolean;
}

/**
 * Creates a commercial document as a DRAFT using an idempotency key.
 *
 * - The first request creates the document and stores the key with the payload hash.
 * - A retry with the same key and payload returns the original document (replay),
 *   whatever its current status, as long as the key has not expired.
 * - The same key with a different payload is rejected.
 * - Expired keys are removed and treated as new requests.
 *
 * Line prices are resolved inside the same transaction as the document. The draft
 * contains no party, payment, bank, shipping or numbering snapshots: those are
 * created during formalization.
 *
 * @param input - Validated document creation payload.
 * @param context - Authenticated tenant and user creation context.
 * @param idempotency - Idempotency key and payload fingerprint.
 * @returns The document and whether the request was a replay.
 * @throws ConflictError When the same key is in flight, the replayed document no
 * longer exists, or a unique constraint (e.g. duplicate supplier document) is violated.
 * @throws ValidationError When the key was already used with a different payload.
 */
export async function createDocument(
  input: CreateDocumentInput,
  context: DocumentCreateContext,
  idempotency: DocumentIdempotency,
): Promise<CreateDocumentResult> {
  const { key, requestHash } = idempotency;

  try {
    return await prisma.$transaction(async (tx) => {
      await acquireIdempotencyLock(tx, context.tenantId, key);

      const existingKey = await tx.documentIdempotencyKey.findUnique({
        where: { tenantId_key: { tenantId: context.tenantId, key } },
      });

      if (existingKey) {
        if (existingKey.expiresAt > new Date()) {
          if (existingKey.requestHash !== requestHash) {
            throw new ValidationError(
              "Idempotency key already used with a different request payload",
            );
          }

          const document = await tx.document.findFirst({
            where: withSoftDelete(withTenantId({ id: existingKey.documentId }, context.tenantId)),
            include: { lines: true },
          });

          if (!document) {
            throw new ConflictError(
              "The document created with this idempotency key no longer exists",
            );
          }

          return { document, replayed: true };
        }

        await tx.documentIdempotencyKey.delete({ where: { id: existingKey.id } });
      }

      const pricingContext = {
        tenantId: context.tenantId,
        documentType: input.documentType,
        currencyCode: input.currencyCode,
        documentDate: new Date(input.documentDate),
        customerId: input.customerId,
      } satisfies DocumentLinePricingContext;

      const [linePricing, lineTax] = await Promise.all([
        Promise.all(
          input.lines.map((line) => resolveDocumentLinePricing(tx, pricingContext, line)),
        ),
        resolveDocumentLinesTax(tx, pricingContext, input.lines),
      ]);
      const document = await tx.document.create({
        data: buildDocumentCreateData({ input, context, linePricing, lineTax }),
        include: { lines: true },
      });

      await tx.documentIdempotencyKey.create({
        data: {
          tenantId: context.tenantId,
          key,
          requestHash,
          documentId: document.id,
          expiresAt: new Date(Date.now() + IDEMPOTENCY_KEY_TTL_MS),
        },
      });

      return { document, replayed: false };
    }, TRANSACTION_LIMITS_OPTIONS);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictError(
        "A document with the same unique data already exists (for supplier documents: same supplier, number and date)",
      );
    }

    throw error;
  }
}
