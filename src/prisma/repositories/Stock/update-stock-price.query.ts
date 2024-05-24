import { PrismaService } from '../../prisma-service.ts'
import { Stock } from '../../../resources/stocks/entities/stock.entity.js'
import { stockToEntityDto } from './dto/stock-to-entity-dto'
import { GlobalQuote } from '../../../services/stock-api.service'

export async function updateStockPriceQuery(ticker: string, data: GlobalQuote, prisma: PrismaService): Promise<Stock> {
  const stock = await prisma.stock.update({
    where: { ticker },
    data: {
      price: Number(data['05. price']),
      changePercent: Number(data['10. change percent']) || 0,
      open: Number(data['02. open']),
      latestTradingDay: new Date()
    }
  })

  return stockToEntityDto(stock)
}