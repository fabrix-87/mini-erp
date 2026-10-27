-- CreateTable
CREATE TABLE "document_idempotency_keys" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "document_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_idempotency_keys_expires_at_idx" ON "document_idempotency_keys"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_idempotency_keys_tenant_id_document_id_key" ON "document_idempotency_keys"("tenant_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_idempotency_keys_tenant_id_key_key" ON "document_idempotency_keys"("tenant_id", "key");

-- AddForeignKey
ALTER TABLE "document_idempotency_keys" ADD CONSTRAINT "document_idempotency_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_idempotency_keys" ADD CONSTRAINT "document_idempotency_keys_tenant_id_document_id_fkey" FOREIGN KEY ("tenant_id", "document_id") REFERENCES "documents"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
