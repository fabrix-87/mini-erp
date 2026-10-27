import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { ConflictError } from "@/utils/app-error-utils";
import { buildDocumentCreateData } from "./document-create-builder";
import type { DocumentCreateContext } from "@/types";
import { CreateDocumentInput, IDEMPOTENCY_KEY_TTL_MS } from "@mini-erp/shared";
import { resolveDocumentLinePricing } from "./document-line-pricing-service";

/** Shape returned by the document creation service. */
export type CreatedDocument = Prisma.DocumentGetPayload<{
  include: {
    lines: true;
  };
}>;

/**
 * Creates a commercial document as a DRAFT using an idempotency key.
 *
 * Line prices are resolved inside the same transaction used to create the
 * document. The resulting document contains no party, payment, bank, shipping
 * or numbering snapshots: those are created only during formalization.
 *
 * @param input - Validated document creation payload.
 * @param context - Authenticated tenant and user creation context.
 * @param idempotencyKey - Client-provided idempotency key.
 * @returns The created DRAFT document, including its lines.
 * @throws ConflictError When the idempotency key is expired or already bound
 * to a non-replayable document.
 */
export async function createDocument(
  input: CreateDocumentInput,
  context: DocumentCreateContext,
  idempotencyKey: string,
): Promise<CreatedDocument> {
  const expiresAt = new Date(Date.now() + IDEMPOTENCY_KEY_TTL_MS);

  try {
    return await prisma.$transaction(async (tx) => {
      const linePricing = await Promise.all(
        input.lines.map((line) => resolveDocumentLinePricing(tx, context.tenantId, line)),
      );

      const documentData = buildDocumentCreateData({
        input,
        context,
        linePricing,
      });

      const document = await tx.document.create({
        data: documentData,
        include: {
          lines: true,
        },
      });

      await tx.documentIdempotencyKey.create({
        data: {
          tenantId: context.tenantId,
          key: idempotencyKey,
          documentId: document.id,
          expiresAt,
        },
      });

      return document;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existingKey = await prisma.documentIdempotencyKey.findUnique({
        where: {
          tenantId_key: {
            tenantId: context.tenantId,
            key: idempotencyKey,
          },
        },
        include: {
          document: {
            include: {
              lines: true,
            },
          },
        },
      });

      if (
        existingKey &&
        existingKey.expiresAt > new Date() &&
        existingKey.document.status === "DRAFT"
      ) {
        return existingKey.document;
      }

      throw new ConflictError("Idempotency key already used or expired for document creation");
    }

    throw error;
  }
}
