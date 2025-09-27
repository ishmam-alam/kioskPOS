-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pin" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "role" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "stock_qty" INTEGER NOT NULL DEFAULT 0,
    "tax_rate" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Register" (
    "id" SERIAL NOT NULL,
    "register_number" INTEGER NOT NULL,
    "name" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sale" (
    "id" SERIAL NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "register_id" INTEGER,
    "tse_signature" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_at" TIMESTAMP(3),
    "user_id" INTEGER,
    "total_cents" INTEGER NOT NULL,
    "items" JSONB,
    "payment_method" TEXT,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SaleItem" (
    "id" SERIAL NOT NULL,
    "receipt_number" TEXT,
    "product_id" INTEGER,
    "qty" INTEGER NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "tax_rate" DOUBLE PRECISION,
    "stock_adjusted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cancellation" (
    "id" SERIAL NOT NULL,
    "receipt_number" TEXT,
    "register_id" INTEGER,
    "tse_signature" TEXT,
    "canceled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,
    "reason" TEXT,
    "amount_cents" INTEGER,
    "payment_method" TEXT,
    "stock_adjusted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cancellation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockIn" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "added_qty" INTEGER NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplier" TEXT,
    "user_id" INTEGER,
    "stock_adjusted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StockIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Turnover" (
    "id" SERIAL NOT NULL,
    "register_id" INTEGER,
    "date" TIMESTAMP(3),
    "total_sales_cents" INTEGER NOT NULL DEFAULT 0,
    "total_refunds_cents" INTEGER NOT NULL DEFAULT 0,
    "net_turnover_cents" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Turnover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TSEDevice" (
    "id" SERIAL NOT NULL,
    "serial_number" TEXT NOT NULL,
    "vendor" TEXT,
    "cert_start" TIMESTAMP(3),
    "cert_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TSEDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RegisterReporting" (
    "id" SERIAL NOT NULL,
    "tse_id" INTEGER,
    "register_id" INTEGER,
    "report_type" TEXT,
    "reported_at" TIMESTAMP(3),
    "status" TEXT,

    CONSTRAINT "RegisterReporting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DSFinvKExport" (
    "id" SERIAL NOT NULL,
    "period_start" TIMESTAMP(3),
    "period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_path" TEXT,

    CONSTRAINT "DSFinvKExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "table_name" TEXT,
    "record_id" INTEGER,
    "action" TEXT,
    "user_id" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "old_value" JSONB,
    "new_value" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryMovement" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change_qty" INTEGER,
    "resulting_qty" INTEGER,
    "movement_type" TEXT,
    "reference_table" TEXT,
    "reference_id" INTEGER,
    "note" TEXT,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DailySalesSummary" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3),
    "total_sales_euro" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "public"."User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "public"."Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_receipt_number_key" ON "public"."Sale"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "TSEDevice_serial_number_key" ON "public"."TSEDevice"("serial_number");

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "public"."Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_receipt_number_fkey" FOREIGN KEY ("receipt_number") REFERENCES "public"."Sale"("receipt_number") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cancellation" ADD CONSTRAINT "Cancellation_receipt_number_fkey" FOREIGN KEY ("receipt_number") REFERENCES "public"."Sale"("receipt_number") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cancellation" ADD CONSTRAINT "Cancellation_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "public"."Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cancellation" ADD CONSTRAINT "Cancellation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockIn" ADD CONSTRAINT "StockIn_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockIn" ADD CONSTRAINT "StockIn_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turnover" ADD CONSTRAINT "Turnover_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "public"."Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegisterReporting" ADD CONSTRAINT "RegisterReporting_tse_id_fkey" FOREIGN KEY ("tse_id") REFERENCES "public"."TSEDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegisterReporting" ADD CONSTRAINT "RegisterReporting_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "public"."Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryMovement" ADD CONSTRAINT "InventoryMovement_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryMovement" ADD CONSTRAINT "InventoryMovement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
