import { Injectable } from '@nestjs/common'
import { CsvItem, CsvItemCategoryEnum } from './entities/cei-csv-upload.entity'
import { StocksService } from '../stocks/stocks.service'

@Injectable()
export class CeiCsvUploadService {
  constructor(private readonly stockService: StocksService) { }

  async addOrders(data: CsvItem[], userId: string) {
    // Filter only the stock orders that aew related to positions
    const allStocks = data.filter((item) =>
      item?.category === CsvItemCategoryEnum.LIQUIDATION ||
      item?.category === CsvItemCategoryEnum.SPREAD ||
      item?.category === CsvItemCategoryEnum.FRACTION ||
      item?.category === CsvItemCategoryEnum.SUBSCRIPTION ||
      item?.category === CsvItemCategoryEnum.BONUS ||
      item?.category === CsvItemCategoryEnum.GROUPING
    )

    return this.stockService.addStockOrders({
      userId,
      orders: allStocks.map((item) => {
        if (!item) return


        if (item.category === CsvItemCategoryEnum.GROUPING) {
          // Subtract 2 hour from date
          item.date.setHours(item.date.getHours() - 2)
        }

        return {
          stockTicker: item.ticker,
          orderType: item.type === 'Credito' || item.category === CsvItemCategoryEnum.SUBSCRIPTION ? 'BUY' : 'SELL',
          quantity: item.quantity,
          price: item.price,
          date: item.date,
          companyName: item.institution,
          orderGroup: item.category,
          grossValue: item.grossValue,
        }
      })
    })
  }
}
