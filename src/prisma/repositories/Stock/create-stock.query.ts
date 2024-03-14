import { PrismaService } from 'src/prisma/prisma-service.ts'
import { CreateStockDtoComplete } from './prisma-stocks.repository'

export async function createStockQuery(createStockDto: CreateStockDtoComplete, prisma: PrismaService): Promise<string> {
  const stock = await prisma.stock.create({
    data: {
      ticker: createStockDto.ticker,
      name: createStockDto.name,
      price: createStockDto.price,
      latestTradingDay: createStockDto.latestTradingDay,
      open: createStockDto.open,
      changePercent: createStockDto.changePercent,
      StockType: {
        connect: {
          name: createStockDto.type
        }
      }
    }
  })

  return stock.id
}