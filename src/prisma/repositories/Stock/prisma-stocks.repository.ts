import { PrismaService } from '../../prisma-service.ts'
import { Stock } from '../../../resources/stocks/entities/stock.entity.js'
import { CreateStockDtoComplete, StockOrderFromUser, StocksRepository } from '../../../resources/stocks/stocks.repository'
import { findStockByTickerQuery } from './find-stock-by-ticker.query'
import { findStockTypesQuery } from './get-stock-types.query'
import { createStockQuery } from './create-stock.query'
import { Injectable } from '@nestjs/common'
import { CreateStockOrderDto } from '../../../resources/stocks/dto/create-stock-order.dto'
import { addStockOrdersQuery } from './add-stock-orders.query'
import { getCurrentStockOrdersFromUserQuery } from './get-current-stocks-from-user.query'
import { GlobalQuote } from '../../../services/stock-api.service'
import { updateStockPriceQuery } from './update-stock-price.query'
import { StockHistory } from '@prisma/client'
import { getCurrentHistoryFromTheMonthQuery } from './get-current-history-from-the-month-query'
import { createHistoryForTheMonthQuery } from './create-history-for-the-month-query'
import { UpdateStockHistory } from 'src/resources/stocks/stocks.service'

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

  updateStockPrice(ticker: string, data: GlobalQuote): Promise<Stock> {
    return updateStockPriceQuery(ticker, data, this.prisma)
  }

  async getCurrentHistoryFromTheMonth(userId: string, month: number, year: number, stockTypeName: string): Promise<StockHistory> {
    let data = await getCurrentHistoryFromTheMonthQuery(userId, month, year, stockTypeName, this.prisma)
    if (!data) {
      data = await createHistoryForTheMonthQuery(userId, stockTypeName, new Date(year, month, 15), 0, this.prisma)
    }
    return data
  }

  async updateHistoryForTheMonth(userId: string, data: UpdateStockHistory): Promise<void> {
    const month = new Date().getMonth()
    const year = new Date().getFullYear()

    const actualStock = await this.getCurrentHistoryFromTheMonth(userId, month, year, 'Ação')
    if (actualStock) {
      await this.prisma.stockHistory.update({
        where: {
          id: actualStock.id
        },
        data: {
          date: new Date(),
          grossValue: data.stock
        }
      })
    }

    const actualReit = await this.getCurrentHistoryFromTheMonth(userId, month, year, 'FII')
    if (actualReit) {
      await this.prisma.stockHistory.update({
        where: {
          id: actualReit.id
        },
        data: {
          date: new Date(),
          grossValue: data.reits
        }
      })
    }

    const actualInternational = await this.getCurrentHistoryFromTheMonth(userId, month, year, 'Internacional')
    if (actualInternational) {
      await this.prisma.stockHistory.update({
        where: {
          id: actualInternational.id
        },
        data: {
          date: new Date(),
          grossValue: data.internationals
        }
      })
    }

    const actualCrypto = await this.getCurrentHistoryFromTheMonth(userId, month, year, 'Crypto')
    if (actualCrypto) {
      await this.prisma.stockHistory.update({
        where: {
          id: actualCrypto.id
        },
        data: {
          date: new Date(),
          grossValue: data.cryptos
        }
      })
    }

    const actualGold = await this.getCurrentHistoryFromTheMonth(userId, month, year, 'Ouro')
    if (actualGold) {
      await this.prisma.stockHistory.update({
        where: {
          id: actualGold.id
        },
        data: {
          date: new Date(),
          grossValue: data.gold
        }
      })
    }
  }
}