import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { ToDo, ToDoList } from './todos.entity'

export abstract class TodosRepository {
  abstract create(userId: string, data: CreateTodoDto): Promise<string>
  abstract findById(id: string): Promise<ToDo | null>
  abstract findAll(userId: string): Promise<ToDoList>
  abstract update(data: UpdateTodoDto): Promise<ToDo>
  abstract deleteById(id: string): Promise<void>
}