import { StockHistory } from '@prisma/client'
import { GlobalQuote } from '../../services/stock-api.service'
import { CreateStockOrderDto } from './dto/create-stock-order.dto'
import { CreateStockDto } from './dto/create-stock.dto'
import { Stock } from './entities/stock.entity'
import { UpdateStockHistory } from './stocks.service'

export interface CreateStockDtoComplete extends CreateStockDto {
  name: string
  price: number
  latestTradingDay: Date
  open: number
  changePercent: number
  date: Date
}

export interface StockOrderFromUser extends Stock {
  quantity: number
  date: Date
  buy: boolean
  orderGroup: string
  grossValue: number
  orderPrice: number
  broker: string
}

export abstract class StocksRepository {
  abstract findStockByTicker(ticker: string): Promise<Stock | null>
  abstract createStock(createStockDto: CreateStockDtoComplete): Promise<string>
  abstract getStockTypes(): Promise<string[]>
  abstract addStockOrders(createStockOrderDto: CreateStockOrderDto): Promise<void>
  abstract getCurrentStockOrdersFromUser(userId: string): Promise<StockOrderFromUser[]>
  abstract updateStockPrice(ticker: string, data: GlobalQuote): Promise<Stock>
  abstract getCurrentHistoryFromTheMonth(userId: string, month: number, year: number, stockTypeName: string): Promise<StockHistory>
  abstract updateHistoryForTheMonth(userId: string, data: UpdateStockHistory): Promise<void>
}