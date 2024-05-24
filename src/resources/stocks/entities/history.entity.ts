import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class StockHistory {
  @Exclude() id: string
  @ApiProperty({ type: '' }) stockTypeName: string
  @Exclude() userId: string
  @ApiProperty({ example: new Date().toISOString() }) date: string
  @ApiProperty({ type: 'number' }) grossValue: number

  constructor(data: StockHistory) {
    Object.assign(this, data)
  }

  public static getMock(): StockHistory {
    const data = {
      id: '21f58a70-3d62-4524-b564-3464d85e9e0d',
      stockTypeName: 'Stock',
      userId: '21f58a70-3d62-4524-b564-3464d85e9e0d',
      date: new Date().toISOString(),
      grossValue: 9999.99
    }

    return new StockHistory(data)
  }
}

export class StockHistorySummaryItem {
  @ApiProperty({ type: 'number' }) grossValue: number
  @ApiProperty({ type: 'number' }) difference: number
  @ApiProperty({ type: 'number' }) percentage: number
}

export class StockHistorySummary {
  @ApiProperty({ example: new Date().toISOString() }) startDate: Date
  @ApiProperty({ example: new Date().toISOString() }) endDate: Date
  @ApiProperty({ type: StockHistorySummaryItem }) stocks: StockHistorySummaryItem
  @ApiProperty({ type: StockHistorySummaryItem }) reits: StockHistorySummaryItem
  @ApiProperty({ type: StockHistorySummaryItem }) internationals: StockHistorySummaryItem
  @ApiProperty({ type: StockHistorySummaryItem }) cryptos: StockHistorySummaryItem
  @ApiProperty({ type: StockHistorySummaryItem }) gold: StockHistorySummaryItem
  @ApiProperty({ type: StockHistorySummaryItem }) general: StockHistorySummaryItem
}

