/*
  Warnings:

  - You are about to alter the column `sku` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `name` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - Made the column `receipt_number` on table `SaleItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `product_id` on table `SaleItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."SaleItem" DROP CONSTRAINT "SaleItem_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."SaleItem" DROP CONSTRAINT "SaleItem_receipt_number_fkey";

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "sku" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."SaleItem" ALTER COLUMN "receipt_number" SET NOT NULL,
ALTER COLUMN "product_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "public"."Product"("sku");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "public"."Product"("active");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "public"."Product"("name");

-- CreateIndex
CREATE INDEX "SaleItem_receipt_number_idx" ON "public"."SaleItem"("receipt_number");

-- CreateIndex
CREATE INDEX "SaleItem_product_id_idx" ON "public"."SaleItem"("product_id");

-- CreateIndex
CREATE INDEX "User_user_id_idx" ON "public"."User"("user_id");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "User_active_idx" ON "public"."User"("active");

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_receipt_number_fkey" FOREIGN KEY ("receipt_number") REFERENCES "public"."Sale"("receipt_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
