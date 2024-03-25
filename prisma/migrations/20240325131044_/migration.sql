/*
  Warnings:

  - You are about to drop the column `new_stock_mean_value` on the `stock_orders` table. All the data in the column will be lost.
  - You are about to drop the column `previous_stock_mean_value` on the `stock_orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stock_orders" DROP COLUMN "new_stock_mean_value",
DROP COLUMN "previous_stock_mean_value",
ADD COLUMN     "gross_value" DECIMAL(10,2) NOT NULL DEFAULT 0;
