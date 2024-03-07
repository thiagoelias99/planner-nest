import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CreateTodoDto } from './create-todo.dto'
import { IsBoolean, IsOptional, IsUUID } from 'class-validator'
import { TodoExists } from '../validators/todo-exists.validator'
import { randomUUID } from 'node:crypto'

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @IsUUID() @TodoExists() @ApiProperty({ example: randomUUID() }) id: string
  @IsBoolean() @IsOptional() @ApiProperty({ examples: [true, false] }) completed?: boolean
}