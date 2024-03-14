-- DropForeignKey
ALTER TABLE "stocks" DROP CONSTRAINT "stocks_type_id_fkey";

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "stock_types"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
