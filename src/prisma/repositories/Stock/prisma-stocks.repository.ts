import { PrismaService } from 'src/prisma/prisma-service.ts'
import { Stock } from 'src/resources/stocks/stock.entity'
import { CreateStockDtoComplete, StockOrderFromUser, StocksRepository } from 'src/resources/stocks/stocks.repository'
import { findStockByTickerQuery } from './find-stock-by-ticker.query'
import { findStockTypesQuery } from './get-stock-types.query'
import { createStockQuery } from './create-stock.query'
import { Injectable } from '@nestjs/common'
import { CreateStockOrderDto } from 'src/resources/stocks/dto/create-stock-order.dto'
import { addStockOrdersQuery } from './add-stock-orders.query'
import { getCurrentStockOrdersFromUserQuery } from './get-current-stocks-from-user.query'

@Injectable()
export class PrismaStocksRepository extends StocksRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  findStockByTicker(ticker: string): Promise<Stock> {
    return findStockByTickerQuery(ticker, this.prisma)
  }

  createStock(createStockDto: CreateStockDtoComplete): Promise<string> {
    return createStockQuery(createStockDto, this.prisma)
  }

  getStockTypes(): Promise<string[]> {
    return findStockTypesQuery(this.prisma)
  }

  addStockOrders(createStockOrderDto: CreateStockOrderDto): Promise<void> {
    return addStockOrdersQuery(createStockOrderDto, this.prisma)
  }

  getCurrentStockOrdersFromUser(userId: string): Promise<StockOrderFromUser[]> {
    return getCurrentStockOrdersFromUserQuery(userId, this.prisma)
  }
}