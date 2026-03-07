-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentStatus" ADD VALUE 'PARTIALLY_FULFILLED';
ALTER TYPE "DocumentStatus" ADD VALUE 'FULFILLED';

-- CreateIndex
CREATE INDEX "UserSetting_userId_idx" ON "UserSetting"("userId");
