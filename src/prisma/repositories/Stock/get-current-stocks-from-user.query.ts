import { PrismaService } from 'src/prisma/prisma-service.ts'
import { StockOrderFromUser } from 'src/resources/stocks/stocks.repository'
// import { Stock } from 'src/resources/stocks/stock.entity'
// import { stockToEntityDto } from './dto/stock-to-entity-dto'

export async function getCurrentStockOrdersFromUserQuery(userId: string, prisma: PrismaService): Promise<StockOrderFromUser[]> {
  const stockOrdersDb = await prisma.stockOrder.findMany({
    where: {
      userId
    },
    include: {
      Stock: true
    }
  })

  const data = stockOrdersDb.map(stockOrder => {
    return {
      id: stockOrder.Stock.id,
      ticker: stockOrder.Stock.ticker,
      name: stockOrder.Stock.name,
      type: stockOrder.Stock.type,
      price: Number(stockOrder.Stock.price),
      latestTradingDay: new Date(stockOrder.Stock.latestTradingDay).toISOString(),
      quantity: Number(stockOrder.quantity),
      date: new Date(stockOrder.createdAt),
      buy: stockOrder.orderType === 'BUY',
      orderGroup: stockOrder.orderGroup,
      grossValue: Number(stockOrder.grossValue),
      orderPrice: Number(stockOrder.price)
    }
  })

  // console.log('data', data[data.length - 1])
  // return data.filter((item) =>
  //   item.ticker === 'CASH3'
  // )
  return data
}