/*
  Warnings:

  - Changed the type of `sku` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "piece" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "sku",
ADD COLUMN     "sku" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "public"."Product"("sku");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "public"."Product"("sku");
