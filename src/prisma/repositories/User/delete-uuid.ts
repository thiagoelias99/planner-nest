import { PrismaService } from '../../prisma-service.ts'

export async function deleteUUidQuery(userId: string, prisma: PrismaService): Promise<unknown> {

  return await prisma.user.delete({
    where: {
      id: userId
    }
  })
}