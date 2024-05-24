import { InternalServerErrorException } from '@nestjs/common'
import { Stock } from '../../../../resources/stocks/entities/stock.entity'

export function stockToEntityDto(stockFromDb: any): Stock {
  try {
    const stock: Stock = new Stock({
      ...stockFromDb,
      price: Number(stockFromDb.price),
      latestTradingDay: new Date(stockFromDb.latestTradingDay).toISOString()
    })

    return stock
  } catch (error) {
    throw new InternalServerErrorException(error)
  }
}