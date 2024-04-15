import { PrismaService } from '../../prisma-service.ts'

export async function findStockTypesQuery(prisma: PrismaService): Promise<string[]> {
  const stockTypes = await prisma.stockType.findMany({
    select: {
      name: true
    }
  })

  return stockTypes.map(type => type.name)
}