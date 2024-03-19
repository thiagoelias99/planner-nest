import { PrismaService } from 'src/prisma/prisma-service.ts'
import { CreateTodoDto } from '../../../resources/todos/dto/create-todo.dto'
import { TodosRepository } from '../../../resources/todos/todos.repository'
import { createTodoQuery } from './create-todo'
import { Injectable } from '@nestjs/common'
import { deleteTodoQuery } from './delete-todo'
import { getTodoByIdQuery } from './get-by-id'
import { ToDo, ToDoList } from '../../../resources/todos/todos.entity'
import { UpdateTodoDto } from '../../../resources/todos/dto/update-todo.dto'
import { findAllByUserQuery } from './find-all-by-user'
import { updateTodoQuery } from './update-todo'

@Injectable()
export class PrismaTodosRepository extends TodosRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async create(userId: string, data: CreateTodoDto): Promise<string> {
    return createTodoQuery(userId, data, this.prisma)
  }

  async findById(id: string): Promise<ToDo | null> {
    return getTodoByIdQuery(id, this.prisma)
  }

  async deleteById(id: string): Promise<void> {
    await deleteTodoQuery(id, this.prisma)
    return
  }

  async findAll(userId: string): Promise<ToDoList> {
    return findAllByUserQuery(userId, this.prisma)
  }

  async update(data: UpdateTodoDto): Promise<ToDo> {
    await updateTodoQuery(data, this.prisma)
    return this.findById(data.id)
  }
}