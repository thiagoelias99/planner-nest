-- CreateTable
CREATE TABLE "stocks" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "latest_trading_day" TIMESTAMP(3) NOT NULL,
    "open" DECIMAL(10,2) NOT NULL,
    "change_percent" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "stock_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_orders" (
    "id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "order_type_id" TEXT,
    "user_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "previous_stock_mean_value" DECIMAL(65,30),
    "new_stock_mean_value" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "order_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stocks_ticker_key" ON "stocks"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "stock_types_name_key" ON "stock_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "order_types_name_key" ON "order_types"("name");

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "stock_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_order_type_id_fkey" FOREIGN KEY ("order_type_id") REFERENCES "order_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
