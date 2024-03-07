import { ToDoList } from '../../../resources/todos/todos.entity'
import { PrismaService } from '../../prisma-service.ts'

export async function findAllByUserQuery(id: string, prisma: PrismaService): Promise<ToDoList> {
  const todosFromDb = await prisma.toDo.findMany({
    where: {
      userId: id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return new ToDoList({
    items: todosFromDb,
    count: todosFromDb.length
  })
}