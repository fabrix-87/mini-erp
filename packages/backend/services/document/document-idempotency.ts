import { createHash } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { ConflictError } from "@/utils/app-error-utils";

/**
 * Recursively sorts object keys so that equivalent payloads serialize identically.
 * Array order is preserved because line order is significant.
 *
 * @param value - Any JSON-compatible value
 * @returns The value with object keys sorted alphabetically
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }

  return value;
}

/**
 * Computes the SHA-256 fingerprint of a request payload.
 * Must be applied to the raw request body: parsed bodies contain defaults
 * generated at parsing time (for example the current date) that change on every retry.
 *
 * @param payload - Raw JSON request body
 * @returns Hex-encoded SHA-256 digest (64 characters)
 */
export function computeRequestHash(payload: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(payload)))
    .digest("hex");
}

/**
 * Acquires a transaction-scoped advisory lock for an idempotency key without waiting.
 * Concurrent requests with the same key are rejected instead of running twice;
 * the lock is released automatically when the transaction ends.
 *
 * @param tx - Prisma transaction client
 * @param tenantId - Current tenant ID
 * @param key - Client-provided idempotency key
 * @throws ConflictError when another request with the same key is still being processed
 */
export async function acquireIdempotencyLock(
  tx: Prisma.TransactionClient,
  tenantId: string,
  key: string,
): Promise<void> {
  const lockName = `document-create:${tenantId}:${key}`;

  const [row] = await tx.$queryRaw<{ locked: boolean }[]>`
    SELECT pg_try_advisory_xact_lock(hashtextextended(${lockName}, 0)) AS locked
  `;

  if (!row?.locked) {
    throw new ConflictError("A request with this idempotency key is already being processed");
  }
}

/**
 * Deletes expired document idempotency keys across all tenants.
 * Intended for a scheduled system job; it is not tenant-scoped on purpose.
 *
 * @param now - Reference instant, defaults to the current time
 * @returns Number of deleted keys
 */
export async function purgeExpiredDocumentIdempotencyKeys(now: Date = new Date()): Promise<number> {
  const { count } = await prisma.documentIdempotencyKey.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  return count;
}
