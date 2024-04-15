import { PrismaService } from '../../prisma-service.ts'
import { Stock } from '../../../resources/stocks/stock.entity'
import { stockToEntityDto } from './dto/stock-to-entity-dto'

export async function findStockByTickerQuery(ticker: string, prisma: PrismaService): Promise<Stock | null> {
  const stockFromDb = await prisma.stock.findUnique({
    where: {
      ticker
    }
  })

  if (!stockFromDb) {
    return null
  }

  return stockToEntityDto(stockFromDb)
}