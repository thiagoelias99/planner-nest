import { ApiProperty } from '@nestjs/swagger'
import { faker } from '@faker-js/faker'
import { Exclude } from 'class-transformer'

export class Stock {
  @ApiProperty({ example: '21f58a70-3d62-4524-b564-3464d85e9e0d' }) id: string
  @ApiProperty({ example: 'PETR4' }) ticker: string
  @ApiProperty({ example: 'Petróleo Brasileiro S.A. - Petrobras' }) name: string
  @ApiProperty({ example: 'Ação' }) type: string
  @ApiProperty({ example: 36.1200 }) price: number
  @ApiProperty({ example: new Date('2024-03-08').toISOString() }) latestTradingDay: string

  constructor(data: Stock) {
    Object.assign(this, data)
  }

  public static getMock(): Stock {
    const data = {
      id: faker.string.uuid(),
      ticker: 'PETR4',
      name: 'Petróleo Brasileiro S.A. - Petrobras',
      type: 'Ação',
      price: 36.1200,
      latestTradingDay: new Date('2024-03-08').toISOString()
    }

    return new Stock(data)
  }
}

export class StockList {
  @ApiProperty({ type: [Stock] }) items: Stock[]
  @ApiProperty({ example: 1 }) count: number

  constructor(data: StockList) {
    Object.assign(this, data)
  }
}

export class StocksFromUser extends Stock {
  @ApiProperty({ example: 1 }) stockQuantity: number
  @Exclude() orderGroup: string
  @ApiProperty({ example: 9999.99 }) totalDepositValue: number
  @ApiProperty({ example: 9999.99 }) totalWithdrawValue: number
  @ApiProperty({ example: 99.99 }) averageStockBuyPrice: number
  @ApiProperty({ example: 0.99 }) profitability: number
  @ApiProperty({ example: 199.99 }) profit: number
}

export class StockType {
  @ApiProperty({ type: [StocksFromUser] }) data: StocksFromUser[]
  @ApiProperty({ example: 9999.99 }) totalAmount: number
  @ApiProperty({ example: 25.00 }) percentage: number
  @ApiProperty({ example: 10 }) count: number
}

export class StocksFromUserList {
  @ApiProperty({ type: [StocksFromUser] }) stocks: StockType
  @ApiProperty({ type: [StocksFromUser] }) reits: StockType
  @ApiProperty({ type: [StocksFromUser] }) internationals: StockType
  @ApiProperty({ type: [StocksFromUser] }) cryptos: StockType
  @ApiProperty({ type: [StocksFromUser] }) gold: StockType
  @ApiProperty({ example: 1 }) count: number
  @ApiProperty({ example: 9999.99 }) totalAmount: number

  constructor(data: StocksFromUserList) {
    Object.assign(this, data)
  }
}