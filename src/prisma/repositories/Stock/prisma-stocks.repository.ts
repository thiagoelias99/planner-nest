import { PrismaService } from 'src/prisma/prisma-service.ts'
import { Stock } from 'src/resources/stocks/stock.entity'
import { StocksRepository } from 'src/resources/stocks/stocks.repository'
import { findStockByTickerQuery } from './find-stock-by-ticker.query'
import { findStockTypesQuery } from './get-stock-types.query'
import { CreateStockDto } from 'src/resources/stocks/dto/create-stock.dto'
import { createStockQuery } from './create-stock.query'

export interface CreateStockDtoComplete extends CreateStockDto {
  name: string
  price: number
  latestTradingDay: string
  open: number
  changePercent: number
}

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
}