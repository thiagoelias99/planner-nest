import { PrismaService } from '../../prisma-service.ts'

export async function createHistoryForTheMonthQuery(userId: string, stockTypeName : string, date: Date, grossValue: number, prisma : PrismaService){  
  const data = await prisma.stockHistory.create({
    data: {
      userId,
      stockTypeName,
      date: date,
      grossValue
    }
  })

  return data
}
