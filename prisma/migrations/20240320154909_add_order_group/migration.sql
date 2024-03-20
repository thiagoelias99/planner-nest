-- AlterTable
ALTER TABLE "stock_orders" ADD COLUMN     "order_group" TEXT;

-- CreateTable
CREATE TABLE "OrderGroup" (
    "name" TEXT NOT NULL,

    CONSTRAINT "OrderGroup_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_order_group_fkey" FOREIGN KEY ("order_group") REFERENCES "OrderGroup"("name") ON DELETE SET NULL ON UPDATE CASCADE;
