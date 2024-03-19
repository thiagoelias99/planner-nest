/*
  Warnings:

  - You are about to drop the column `order_type_id` on the `stock_orders` table. All the data in the column will be lost.
  - You are about to drop the column `stock_id` on the `stock_orders` table. All the data in the column will be lost.
  - Added the required column `stock_tickers` to the `stock_orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_order_type_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_stock_id_fkey";

-- AlterTable
ALTER TABLE "stock_orders" DROP COLUMN "order_type_id",
DROP COLUMN "stock_id",
ADD COLUMN     "order_type" TEXT,
ADD COLUMN     "stock_tickers" TEXT NOT NULL,
ALTER COLUMN "previous_stock_mean_value" SET DEFAULT 0,
ALTER COLUMN "new_stock_mean_value" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_stock_tickers_fkey" FOREIGN KEY ("stock_tickers") REFERENCES "stocks"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_order_type_fkey" FOREIGN KEY ("order_type") REFERENCES "order_types"("name") ON DELETE SET NULL ON UPDATE CASCADE;
