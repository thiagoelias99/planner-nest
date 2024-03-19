import { Injectable } from '@nestjs/common'
import { CsvItem, CsvItemCategoryEnum } from './entities/cei-csv-upload.entity'
import { StocksService } from '../stocks/stocks.service'

@Injectable()
export class CeiCsvUploadService {
  constructor(private readonly stockService: StocksService) { }

  async addOrders(data: CsvItem[], userId: string) {
    // Filter only the stocks that are in liquidation
    const allStocks = data.filter((item) => item?.category === CsvItemCategoryEnum.LIQUIDATION)

    return this.stockService.addStockOrders({
      userId,
      orders: allStocks.map((item) => {
        if (!item) return

        return {
          stockTicker: item.ticker,
          orderType: item.type === 'Debito' ? 'BUY' : 'SELL',
          quantity: item.quantity,
          price: item.price,
          date: item.date,
          companyName: item.institution
        }
      })
    })
  }
}
