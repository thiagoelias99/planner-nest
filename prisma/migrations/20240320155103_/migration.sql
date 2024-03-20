/*
  Warnings:

  - You are about to drop the `OrderGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_order_group_fkey";

-- DropTable
DROP TABLE "OrderGroup";

-- CreateTable
CREATE TABLE "order_groups" (
    "name" TEXT NOT NULL,

    CONSTRAINT "order_groups_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_order_group_fkey" FOREIGN KEY ("order_group") REFERENCES "order_groups"("name") ON DELETE SET NULL ON UPDATE CASCADE;
