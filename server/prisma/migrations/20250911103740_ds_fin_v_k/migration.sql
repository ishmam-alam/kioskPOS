-- CreateEnum
CREATE TYPE "public"."ProcessType" AS ENUM ('BELEG', 'STORNO', 'ABSCHLUSS');

-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "process_type" "public"."ProcessType" NOT NULL DEFAULT 'BELEG',
ADD COLUMN     "tse_public_key" TEXT,
ADD COLUMN     "tse_serial" TEXT,
ADD COLUMN     "tse_sig_counter" INTEGER,
ADD COLUMN     "tse_signature_algo" TEXT,
ADD COLUMN     "tse_signed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."SaleItem" ADD COLUMN     "gross_amount_cents" INTEGER,
ADD COLUMN     "net_amount_cents" INTEGER,
ADD COLUMN     "tax_amount_cents" INTEGER,
ADD COLUMN     "vat_class" TEXT;

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransactionJournal" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER,
    "cancel_id" INTEGER,
    "register_id" INTEGER NOT NULL,
    "tse_serial" TEXT NOT NULL,
    "tse_sig" TEXT NOT NULL,
    "prev_hash" TEXT,
    "curr_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionJournal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_sale_id_idx" ON "public"."Payment"("sale_id");

-- CreateIndex
CREATE INDEX "TransactionJournal_register_id_idx" ON "public"."TransactionJournal"("register_id");

-- CreateIndex
CREATE INDEX "SaleItem_vat_class_idx" ON "public"."SaleItem"("vat_class");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransactionJournal" ADD CONSTRAINT "TransactionJournal_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransactionJournal" ADD CONSTRAINT "TransactionJournal_cancel_id_fkey" FOREIGN KEY ("cancel_id") REFERENCES "public"."Cancellation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransactionJournal" ADD CONSTRAINT "TransactionJournal_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "public"."Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
