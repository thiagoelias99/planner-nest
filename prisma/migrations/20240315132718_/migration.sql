/*
  Warnings:

  - Made the column `order_type` on table `stock_orders` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_order_type_fkey";

-- AlterTable
ALTER TABLE "stock_orders" ALTER COLUMN "order_type" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_order_type_fkey" FOREIGN KEY ("order_type") REFERENCES "order_types"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
