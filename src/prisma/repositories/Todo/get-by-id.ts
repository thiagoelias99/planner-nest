export async function getTodoByIdQuery(todoId, prisma) {
  return prisma.toDo.findUnique({
    where: { id: todoId },
  })
}