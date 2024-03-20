import { Injectable } from '@nestjs/common'
import { StocksRepository } from './stocks.repository'
import { Stock, StocksFromUser, StocksFromUserList } from './stock.entity'
import { CreateStockOrderDto } from './dto/create-stock-order.dto'

export interface GlobalQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': Date;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

export interface Response2 {
  bestMatches: BestMatch[];
}

export interface BestMatch {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

@Injectable()
export class StocksService {
  constructor(private readonly stockRepository: StocksRepository) { }

  async findStockByTicker(ticker: string): Promise<Stock | null> {
    console.log('findStockByTicker', ticker)
    return this.stockRepository.findStockByTicker(ticker)
  }

  // async createStock(createStockDto: CreateStockDto): Promise<string> {
  //   console.log('createStock', createStockDto)

  //   //Completar os dados
  //   const { data: response1 } = await axios.get<GlobalQuote>(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${createStockDto.ticker}.SAO&apikey=JGNFMJRJ5CDN0T4K`)
  //   // console.log('response1', response1)
  //   const { data: response2 } = await axios.get<Response2>(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${createStockDto.ticker}&apikey=JGNFMJRJ5CDN0T4K`)

  //   console.log('response2', response2)

  //   const stockType = response2?.bestMatches[0]['3. type'] === 'Equity' ? 'Ação' : 'ETF'

  //   const completedData: CreateStockDtoComplete = {
  //     changePercent: Number(response1['Global Quote']['10. change percent'].replace('%', '')),
  //     name: response2.bestMatches[0]['2. name'],
  //     open: Number(response1['Global Quote']['02. open']),
  //     price: Number(response1['Global Quote']['05. price']),
  //     ticker: createStockDto.ticker,
  //     latestTradingDay: new Date(response1['Global Quote']['07. latest trading day']),
  //     type: stockType
  //   }

  //   console.log(completedData)

  //   return this.stockRepository.createStock(completedData)
  // }

  async getStockTypes(): Promise<string[]> {
    return this.stockRepository.getStockTypes()
  }

  async addStockOrders(data: CreateStockOrderDto) {
    return this.stockRepository.addStockOrders(data)
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

    // console.log('stockOrdersFromUser', stockOrdersFromUser)

    const stocksMap = new Map<string, StocksFromUser>()

    stockOrdersFromUser.forEach(order => {
      // Substitute XXXX12, XXXX13, XXXX14, XXXX15 to XXXX11
      order.ticker = order.ticker.replace(/\d{2}$/, '11')

      // Substitute VIVT3 to VIVT4
      order.ticker = order.ticker.replace('VIVT3', 'VIVT4')

      if (stocksMap.has(order.ticker)) {
        const currentStock = stocksMap.get(order.ticker)

        let quantity = 0
        if (order.orderGroup === 'Grupamento') {
          quantity = order.quantity
        } else {
          quantity = currentStock.quantity + order.quantity * (order.buy ? 1 : -1)
        }

        stocksMap.set(order.ticker, {
          ...currentStock,
          quantity
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
          quantity: order.quantity * (order.buy ? 1 : -1)
        })
      }
    })

    const noZeroStocks = Array
      .from(stocksMap.values())
      .filter(stock => stock.quantity !== 0)
      .sort((a, b) => {
        if (a.ticker < b.ticker) {
          return -1
        }
        if (a.ticker > b.ticker) {
          return 1
        }
        return 0
      })

    console.log('stocksFromUser', noZeroStocks)

    const data = {
      stocks: [
        {
          id: '21f58a70-3d62-4524-b564-3464d85e9e0d',
          ticker: 'PETR4',
          name: 'Petróleo Brasileiro S.A. - Petrobras',
          type: 'Ação',
          price: 36.1200,
          latestTradingDay: new Date('2024-03-08').toISOString(),
          quantity: 10,
          orderGroup: 'Transferência - Liquidação'
        }
      ],
      count: 1
    }

    return data
  }
}
