import { PickType } from '@nestjs/swagger'
import { UpdateTodoDto } from './update-todo.dto'

export class DeleteTodoDto extends PickType(UpdateTodoDto, ['id']) {}