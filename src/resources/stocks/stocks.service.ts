import { Injectable } from '@nestjs/common'
import { StocksRepository } from './stocks.repository'
import { Stock, StockType, StocksFromUser, StocksFromUserList } from './stock.entity'
import { CreateStockOrderDto } from './dto/create-stock-order.dto'
import { StockApiService } from 'src/services/stock-api.service'
import * as moment from 'moment'

@Injectable()
export class StocksService {
  constructor(
    private readonly stockRepository: StocksRepository,
    private readonly stockApiService: StockApiService
  ) { }

  async findStockByTicker(ticker: string): Promise<Stock | null> {
    return this.stockRepository.findStockByTicker(ticker)
  }

  async getStockTypes(): Promise<string[]> {
    return this.stockRepository.getStockTypes()
  }

  async addStockOrders(data: CreateStockOrderDto) {
    return this.stockRepository.addStockOrders(data)
  }

  async refreshStock(ticker: string): Promise<Stock> {
    const updateData = await this.stockApiService.updateStock(ticker)
    if (!updateData) {
      return null
    }

    return this.stockRepository.updateStockPrice(ticker, updateData)
  }

  async getCurrentStocksFromUser(userId: string): Promise<StocksFromUserList> {
    const stockOrdersFromUser = await this.stockRepository.getCurrentStockOrdersFromUser(userId).then(data => {
      // Order by date asc
      return data.sort((a, b) => {
        if (a.date < b.date) {
          return -1
        }
        if (a.date > b.date) {
          return 1
        }
        return 0
      })
    })

    const stocksMap = new Map<string, StocksFromUser>()

    stockOrdersFromUser.forEach(order => {
      // Substitute XXXX12, XXXX13, XXXX14, XXXX15 to XXXX11 (FIIs)
      order.ticker = order.ticker.replace(/\d{2}$/, '11')

      // Substitute VIVT3 to VIVT4
      order.ticker = order.ticker.replace('VIVT3', 'VIVT4')

      // Ignore IVVB11 from Clear
      if (order.broker.startsWith('CLEAR') && order.ticker === 'IVVB11') {
        return
      }

      // Consider MGLU3 only from Clear
      if (order.ticker === 'MGLU3' && !order.broker.startsWith('CLEAR')) {
        return
      }

      if (stocksMap.has(order.ticker)) {
        const currentStock = stocksMap.get(order.ticker)

        let stockQuantity = 0
        // Affect CASH3
        if (order.orderGroup === 'Grupamento') {
          stockQuantity = order.quantity
        } else {
          stockQuantity = currentStock.stockQuantity + order.quantity * (order.buy ? 1 : -1)
        }

        // Calculate average stock buy price
        let averageStockBuyPrice = currentStock.averageStockBuyPrice
        if (order.buy) {
          if (currentStock.stockQuantity === 0) {
            averageStockBuyPrice = order.orderPrice
          } else {
            averageStockBuyPrice = (((currentStock.averageStockBuyPrice * currentStock.stockQuantity) + (order.grossValue)) / stockQuantity)
          }
        }

        stocksMap.set(order.ticker, {
          ...currentStock,
          stockQuantity,
          totalDepositValue: currentStock.totalDepositValue + (order.buy ? order.grossValue : 0),
          totalWithdrawValue: currentStock.totalWithdrawValue + (order.buy ? 0 : order.grossValue),
          averageStockBuyPrice
        })
      } else {
        stocksMap.set(order.ticker, {
          id: order.id,
          ticker: order.ticker,
          name: order.name,
          type: order.type,
          orderGroup: order.orderGroup,
          price: order.price,
          latestTradingDay: order.latestTradingDay,
          stockQuantity: order.quantity * (order.buy ? 1 : -1),
          totalDepositValue: order.grossValue,
          totalWithdrawValue: 0,
          averageStockBuyPrice: order.orderPrice,
          profitability: 0
        })
      }
    })

    const noZeroStocks = Array
      .from(stocksMap.values())
      .filter(stock => stock.stockQuantity !== 0)
      .sort((a, b) => {
        if (a.ticker < b.ticker) {
          return -1
        }
        if (a.ticker > b.ticker) {
          return 1
        }
        return 0
      })

    // Delete orderGroup
    noZeroStocks.forEach(stock => {
      delete stock.orderGroup
    })

    // If stock latestTradingDay is 2 day ago, update from api
    const today = moment()

    await Promise.all(
      noZeroStocks.map(stock => new Promise((resolve) => {
        // If stock = GOLD11 or IVVB11, ignore
        if (stock.ticker === 'GOLD11' || stock.ticker === 'IVVB11') {
          resolve('')
        }

        const latestTradingDay = moment(stock.latestTradingDay)
        const diffDays = today.diff(latestTradingDay, 'day')
        if (diffDays > 1) {
          this.refreshStock(stock.ticker)
            .then(updatedStock => {
              if (updatedStock) {
                stock.price = updatedStock.price
                stock.latestTradingDay = updatedStock.latestTradingDay
              }
            })
        }

        // update profitability
        if (stock.price === 0) {
          stock.profitability = 0
        } else {
          stock.profitability = (stock.price / stock.averageStockBuyPrice - 1) * 100
        }

        resolve('')
      }))
    )

    const totalAmount = noZeroStocks.reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0)

    const stocks: StockType = {
      data: noZeroStocks.filter(stock => stock.type === 'Ação'),
      totalAmount: noZeroStocks.filter(stock => stock.type === 'Ação').reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0),
      percentage: totalAmount === 0 ? 0 : (noZeroStocks.filter(stock => stock.type === 'Ação').reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0) / totalAmount) * 100,
      count: noZeroStocks.filter(stock => stock.type === 'Ação').length
    }

    const reits: StockType = {
      data: noZeroStocks.filter(stock => stock.type === 'FII'),
      totalAmount: noZeroStocks.filter(stock => stock.type === 'FII').reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0),
      percentage: totalAmount === 0 ? 0 : (noZeroStocks.filter(stock => stock.type === 'FII').reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0) / totalAmount) * 100,
      count: noZeroStocks.filter(stock => stock.type === 'FII').length
    }

    const internationals: StockType = {
      data: noZeroStocks.filter(stock => stock.ticker === 'IVVB11'),
      totalAmount: noZeroStocks.filter(stock => stock.ticker === 'IVVB11').reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0),
      percentage: totalAmount === 0 ? 0 : (noZeroStocks.filter(stock => stock.ticker === 'IVVB11').reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0) / totalAmount) * 100,
      count: noZeroStocks.filter(stock => stock.ticker === 'IVVB11').length
    }

    const cryptos: StockType = {
      data: noZeroStocks.filter(stock => stock.ticker === 'QBTC11'),
      totalAmount: noZeroStocks.filter(stock => stock.ticker === 'QBTC11').reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0),
      percentage: totalAmount === 0 ? 0 : (noZeroStocks.filter(stock => stock.ticker === 'QBTC11').reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0) / totalAmount) * 100,
      count: noZeroStocks.filter(stock => stock.ticker === 'QBTC11').length
    }

    const gold: StockType = {
      data: noZeroStocks.filter(stock => stock.ticker === 'GOLD11'),
      totalAmount: noZeroStocks.filter(stock => stock.ticker === 'GOLD11').reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0),
      percentage: totalAmount === 0 ? 0 : (noZeroStocks.filter(stock => stock.ticker === 'GOLD11').reduce((acc, stock) => acc + stock.price * stock.stockQuantity, 0) / totalAmount) * 100,
      count: noZeroStocks.filter(stock => stock.ticker === 'GOLD11').length
    }

    const data: StocksFromUserList = {
      count: noZeroStocks.length,
      totalAmount,
      stocks,
      reits,
      internationals,
      cryptos,
      gold
    }

    return data
  }
}