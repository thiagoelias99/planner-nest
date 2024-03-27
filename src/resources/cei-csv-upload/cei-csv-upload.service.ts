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

        // Bonificação ITSA4
        if (item.ticker === 'ITSA4' && item.category === CsvItemCategoryEnum.BONUS) {
          // If date is between 2021-12-20 and 2021-12-23 set the price to 18.89
          if (item.date >= new Date('2021-12-20') && item.date <= new Date('2021-12-23')) {
            item.price = 18.89
            item.grossValue = item.quantity * item.price
          }
          // If date is between 2022-11-10 and 2022-11-16 set the price to 13,65
          if (item.date >= new Date('2022-11-10') && item.date <= new Date('2022-11-16')) {
            item.price = 13.65
            item.grossValue = item.quantity * item.price
          }
          // If date is between 2023-11-27 and 2023-12-02 set the price to 17,92
          if (item.date >= new Date('2023-11-27') && item.date <= new Date('2023-12-02')) {
            item.price = 17.92
            item.grossValue = item.quantity * item.price
          }
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
