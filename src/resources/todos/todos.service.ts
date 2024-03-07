import { Injectable } from '@nestjs/common'
import { CreateTodoDto } from './dto/create-todo.dto'
import { TodosRepository } from './todos.repository'
import { ToDo, ToDoList } from './todos.entity'
import { UpdateTodoDto } from './dto/update-todo.dto'

@Injectable()
export class TodosService {
  constructor(private readonly repository: TodosRepository) { }

  async create(userId: string, data: CreateTodoDto): Promise<ToDo> {
    const id = await this.repository.create(userId, data)
    return this.repository.findById(id)
  }

  async findById(id: string): Promise<ToDo | null> {
    return this.repository.findById(id)
  }

  async findAll(userId: string): Promise<ToDoList> {
    return this.repository.findAll(userId)
  }

  async update(data: UpdateTodoDto): Promise<ToDo> {
    return this.repository.update(data)
  }

  async deleteById(id: string): Promise<void> {
    return this.repository.deleteById(id)
  }

}
