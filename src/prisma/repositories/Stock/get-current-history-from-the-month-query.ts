import { PrismaService } from '../../prisma-service.ts'

export function getCurrentHistoryFromTheMonthQuery(userId, month, year, stockTypeName, prisma: PrismaService) {
  // Get last month day and hour in UTC
  const lastMonthDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
  const firstMonthDay = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))

  const data = prisma.stockHistory.findFirst({
    where: {
      userId,
      stockTypeName,
      date: {
        lte: lastMonthDay,
        gte: firstMonthDay
      }
    }
  })

  return data
}