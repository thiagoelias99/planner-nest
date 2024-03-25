import { PrismaService } from 'src/prisma/prisma-service.ts'
import { CreateStockOrderDto } from 'src/resources/stocks/dto/create-stock-order.dto'

export async function addStockOrdersQuery({ orders, userId }: CreateStockOrderDto, prisma: PrismaService): Promise<any> {
  let added: number = 0
  let ignored: number = 0
  let errors: number = 0

  await Promise.all(orders.map(async (order) => {
    if (!order) return

    const alreadyExists = await prisma.stockOrder.findMany({
      where: {
        AND: [
          { userId: userId },
          { stockTicker: order.stockTicker },
          { orderType: order.orderType },
          { quantity: order.quantity },
          {
            price: {
              gte: order.price * 0.0001,
              lte: order.price + 1.0001
            }
          },
          {
            createdAt: {
              equals: new Date(order.date)
            }
          }
        ]
      }
    })

    if (alreadyExists.length > 0) {
      ignored++
      return
    } else {
      try {
        await prisma.stockOrder.create({
          data: {
            quantity: order.quantity,
            price: order.price,
            createdAt: order.date,
            grossValue: order.grossValue,
            Stock: {
              connectOrCreate: {
                where: {
                  ticker: order.stockTicker
                },
                create: {
                  ticker: order.stockTicker,
                  name: order.companyName,
                  changePercent: 0,
                  open: 0,
                  latestTradingDay: new Date(),
                  price: 0,
                  StockType: {
                    connect: {
                      name: 'Ação'
                    }
                  },
                }
              }
            },
            User: {
              connect: {
                id: userId
              }
            },
            OrderType: {
              connect: {
                name: order.orderType
              }
            },
            OrderGroup: {
              connectOrCreate: {
                where: {
                  name: order.orderGroup
                },
                create: {
                  name: order.orderGroup
                }
              }
            }
          }
        })
        added++
      } catch (error) {
        errors++
        console.error('error', error)
        console.error('order', order)
      }
    }
  }))

  // console.log(`Added: ${added} Ignored: ${ignored} Errors: ${errors}`)
  return { added, ignored, errors }
}