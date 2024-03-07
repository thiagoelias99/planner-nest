import { CreateTodoDto } from '../../../resources/todos/dto/create-todo.dto'
import { PrismaService } from '../../prisma-service.ts'

export async function createTodoQuery(userId: string, data: CreateTodoDto, prisma: PrismaService): Promise<string> {
  const todoFromDb = await prisma.toDo.create({
    data: {
      ...data,
      userId: userId
    }
  })

  return todoFromDb.id
}