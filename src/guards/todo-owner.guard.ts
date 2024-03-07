import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { UserRequest } from './auth.guard'
import { TodosService } from '../resources/todos/todos.service'

@Injectable()
export class TodoOwnerGuard implements CanActivate {
  constructor(private readonly todosService: TodosService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    try {
      const userId = this.extractUserIdFromRequest(request)
      const todoId = this.extractTodoIdFromRequest(request)
      const todo = await this.todosService.findById(todoId)

      return todo.userId === userId
    } catch (error) {
      return false
    }
  }

  private extractUserIdFromRequest(request: UserRequest): string {
    const { id } = request.user
    return id
  }

  private extractTodoIdFromRequest(request: UserRequest): string {
    const { id } = request.body
    return id
  }
}

