import { Injectable } from '@nestjs/common'
import { StocksRepository } from './stocks.repository'
import { Stock, StockType, StocksFromUser, StocksFromUserList } from './entities/stock.entity'
import { CreateStockOrderDto } from './dto/create-stock-order.dto'
import { StockApiService } from '../../services/stock-api.service'
import * as moment from 'moment'
import { StockHistorySummary } from './entities/history.entity'

export interface UpdateStockHistory {
  stock: number
  reits: number
  internationals: number
  cryptos: number
  gold: number
}

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
          profitability: 0,
          profit: 0
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

    // If stock latestTradingDay is 1 day ago and after 19pm, update from api
    const today = moment()

    await Promise.all(
      noZeroStocks.map(stock => new Promise((resolve) => {
        // If stock = GOLD11 or IVVB11, ignore
        if (stock.ticker === 'GOLD11' || stock.ticker === 'IVVB11') {
          resolve('')
        }

        const latestTradingDay = moment(stock.latestTradingDay)
        const diffDays = today.diff(latestTradingDay, 'day')
        const hour = today.hour()
        if (diffDays >= 1 && hour >= 19) {
          this.refreshStock(stock.ticker)
            .then(updatedStock => {
              if (updatedStock) {
                stock.price = updatedStock.price
                stock.latestTradingDay = updatedStock.latestTradingDay
              }
            })
        }

        // update profit & profitability
        if (stock.price === 0) {
          stock.profitability = 0
          stock.profit = 0
        } else {
          stock.profitability = (stock.price / stock.averageStockBuyPrice - 1) * 100
          stock.profit = (stock.price - stock.averageStockBuyPrice) * stock.stockQuantity
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

    // Update History
    await this.updateHistoryForTheMonth(userId, {
      stock: stocks.totalAmount,
      reits: reits.totalAmount,
      internationals: internationals.totalAmount,
      cryptos: cryptos.totalAmount,
      gold: gold.totalAmount
    })

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

  // Atualizar historico do mes
  async updateHistoryForTheMonth(userId: string, data: UpdateStockHistory) {
    await this.stockRepository.updateHistoryForTheMonth(userId, data)
  }

  // Buscar historico atual do mes
  async getCurrentHistoryFromTheMonth(userId: string, month: number, year: number): Promise<StockHistorySummary | null> {
    // Buscar historico para cada classe de ativo
    const stocksEnd = await this.stockRepository.getCurrentHistoryFromTheMonth(userId, month, year, 'Ação')
    const reitsEnd = await this.stockRepository.getCurrentHistoryFromTheMonth(userId, month, year, 'FII')
    const internationalsEnd = await this.stockRepository.getCurrentHistoryFromTheMonth(userId, month, year, 'Internacional')
    const cryptosEnd = await this.stockRepository.getCurrentHistoryFromTheMonth(userId, month, year, 'Crypto')
    const goldEnd = await this.stockRepository.getCurrentHistoryFromTheMonth(userId, month, year, 'Ouro')

    const stocksStart = await this.stockRepository.getCurrentHistoryFromTheMonth(userId, month - 1, year, 'Ação')
    const reitsStart = await this.stockRepository.getCurrentHistoryFromTheMonth(userId, month - 1, year, 'FII')
    const internationalsStart = await this.stockRepository.getCurrentHistoryFromTheMonth(userId, month - 1, year, 'Internacional')
    const cryptosStart = await this.stockRepository.getCurrentHistoryFromTheMonth(userId, month - 1, year, 'Crypto')
    const goldStart = await this.stockRepository.getCurrentHistoryFromTheMonth(userId, month - 1, year, 'Ouro')

    const totalStartAmount = Number(stocksStart.grossValue) + Number(reitsStart.grossValue) + Number(internationalsStart.grossValue) + Number(cryptosStart.grossValue) + Number(goldStart.grossValue)
    const totalEndAmount = Number(stocksEnd.grossValue) + Number(reitsEnd.grossValue) + Number(internationalsEnd.grossValue) + Number(cryptosEnd.grossValue) + Number(goldEnd.grossValue)

    return {
      startDate: moment().set('month', month - 1).set('year', year).startOf('month').toDate(),
      endDate: moment().set('month', month).set('year', year).endOf('month').toDate(),
      stocks: {
        grossValue: Number(stocksEnd.grossValue),
        difference: Number(stocksEnd.grossValue) - Number(stocksStart.grossValue),
        percentage: Number(stocksStart.grossValue) === 0 || Number(stocksEnd.grossValue) === 0 ? 0 : ((Number(stocksEnd.grossValue) / Number(stocksStart.grossValue)) - 1) * 100
      },
      reits: {
        grossValue: Number(reitsEnd.grossValue),
        difference: Number(reitsEnd.grossValue) - Number(reitsStart.grossValue),
        percentage: Number(reitsStart.grossValue) === 0 || Number(reitsEnd.grossValue) === 0 ? 0 : ((Number(reitsEnd.grossValue) / Number(reitsStart.grossValue)) - 1) * 100
      },
      internationals: {
        grossValue: Number(internationalsEnd.grossValue),
        difference: Number(internationalsEnd.grossValue) - Number(internationalsStart.grossValue),
        percentage: Number(internationalsStart.grossValue) === 0 || Number(internationalsEnd.grossValue) === 0 ? 0 : ((Number(internationalsEnd.grossValue) / Number(internationalsStart.grossValue)) - 1) * 100
      },
      cryptos: {
        grossValue: Number(cryptosEnd.grossValue),
        difference: Number(cryptosEnd.grossValue) - Number(cryptosStart.grossValue),
        percentage: Number(cryptosStart.grossValue) === 0 || Number(cryptosEnd.grossValue) === 0 ? 0 : ((Number(cryptosEnd.grossValue) / Number(cryptosStart.grossValue)) - 1) * 100
      },
      gold: {
        grossValue: Number(goldEnd.grossValue),
        difference: Number(goldEnd.grossValue) - Number(goldStart.grossValue),
        percentage: Number(goldStart.grossValue) === 0 || Number(goldEnd.grossValue) === 0 ? 0 : ((Number(goldEnd.grossValue) / Number(goldStart.grossValue)) - 1) * 100
      },
      general: {
        grossValue: totalEndAmount,
        difference: totalEndAmount - totalStartAmount,
        percentage: totalStartAmount === 0 || totalEndAmount === 0 ? 0 : ((totalEndAmount / totalStartAmount) - 1) * 100
      }
    }
  }
}

