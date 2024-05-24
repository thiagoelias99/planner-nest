-- CreateTable
CREATE TABLE "stock_histories" (
    "id" TEXT NOT NULL,
    "stock_type_name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "gross_value" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "stock_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stock_histories" ADD CONSTRAINT "stock_histories_stock_type_name_fkey" FOREIGN KEY ("stock_type_name") REFERENCES "stock_types"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_histories" ADD CONSTRAINT "stock_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
