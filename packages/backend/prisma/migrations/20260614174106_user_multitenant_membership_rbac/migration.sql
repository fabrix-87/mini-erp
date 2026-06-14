/*
  Warnings:

  - You are about to drop the column `tenant_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_UserRoles` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED');

-- DropForeignKey
ALTER TABLE "_UserRoles" DROP CONSTRAINT "_UserRoles_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserRoles" DROP CONSTRAINT "_UserRoles_B_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_tenant_id_fkey";

-- DropIndex
DROP INDEX "users_tenant_id_idx";

-- AlterTable
ALTER TABLE "user_details" ALTER COLUMN "date_of_birth" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "tenant_id";

-- DropTable
DROP TABLE "_UserRoles";

-- CreateTable
CREATE TABLE "user_tenant_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tenant_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tenant_membership_roles" (
    "membership_id" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_tenant_membership_roles_pkey" PRIMARY KEY ("membership_id","role_id")
);

-- CreateIndex
CREATE INDEX "user_tenant_memberships_user_id_idx" ON "user_tenant_memberships"("user_id");

-- CreateIndex
CREATE INDEX "user_tenant_memberships_tenant_id_idx" ON "user_tenant_memberships"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tenant_memberships_user_id_tenant_id_key" ON "user_tenant_memberships"("user_id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_default_user_tenant" ON "user_tenant_memberships"("user_id") WHERE ("is_default" = true);

-- CreateIndex
CREATE INDEX "user_tenant_membership_roles_role_id_idx" ON "user_tenant_membership_roles"("role_id");

-- AddForeignKey
ALTER TABLE "user_tenant_memberships" ADD CONSTRAINT "user_tenant_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tenant_memberships" ADD CONSTRAINT "user_tenant_memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tenant_membership_roles" ADD CONSTRAINT "user_tenant_membership_roles_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "user_tenant_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tenant_membership_roles" ADD CONSTRAINT "user_tenant_membership_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
