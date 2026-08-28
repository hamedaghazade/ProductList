-- CreateEnum
CREATE TYPE "BarcodeType" AS ENUM ('EAN13', 'CODE128');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "quantity_per_package" INTEGER NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "barcode" VARCHAR(64) NOT NULL,
    "barcode_type" "BarcodeType" NOT NULL DEFAULT 'EAN13',
    "telegram_user_id" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_telegram_user_id_idx" ON "products"("telegram_user_id");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_telegram_user_id_barcode_key" ON "products"("telegram_user_id", "barcode");
