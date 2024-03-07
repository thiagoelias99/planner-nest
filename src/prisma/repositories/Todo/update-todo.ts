import { PrismaService } from '../../prisma-service.ts'
import { UpdateTodoDto } from '../../../resources/todos/dto/update-todo.dto'

export async function updateTodoQuery(data: UpdateTodoDto, prisma: PrismaService) {
  const { id, ...rest } = data
  return prisma.toDo.update({
    where: { id },
    data: {
      ...rest
    }
  })
}