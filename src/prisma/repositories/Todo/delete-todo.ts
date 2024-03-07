import { PrismaService } from '../../prisma-service.ts'

export async function deleteTodoQuery(todoId: string, prisma: PrismaService) {
  return prisma.toDo.delete({
    where: { id: todoId },
  })
}