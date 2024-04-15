import { PrismaService } from '../../prisma-service.ts'
import { CreateStockDtoComplete } from '../../../resources/stocks/stocks.repository'


export async function createStockQuery(createStockDto: CreateStockDtoComplete, prisma: PrismaService): Promise<string> {
  const stock = await prisma.stock.upsert({
    where: {
      ticker: createStockDto.ticker
    },
    create: {
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
    },
    update: {
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
    // data: {
    //   ticker: createStockDto.ticker,
    //   name: createStockDto.name,
    //   price: createStockDto.price,
    //   latestTradingDay: createStockDto.latestTradingDay,
    //   open: createStockDto.open,
    //   changePercent: createStockDto.changePercent,
    //   StockType: {
    //     connect: {
    //       name: createStockDto.type
    //     }
    //   }
    // }
  })

  return stock.id
}