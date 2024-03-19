import { Injectable } from '@nestjs/common'
import { CsvItem, CsvItemCategoryEnum } from './entities/cei-csv-upload.entity'
import { StocksService } from '../stocks/stocks.service'

@Injectable()
export class CeiCsvUploadService {
  constructor(private readonly stockService: StocksService) { }

  async addOrders(data: CsvItem[]) {
    // Filter only the stocks that are in liquidation
    const allStocks = data.filter((item) => item?.category === CsvItemCategoryEnum.LIQUIDATION)

    return this.stockService.addStockOrders({
      userId: '82e2a8a9-00cc-498d-9225-4de92752fd9c',
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
