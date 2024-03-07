import { Module } from '@nestjs/common'
import { TodosService } from './todos.service'
import { TodosController } from './todos.controller'
import { PrismaModule } from '../../prisma/prisma.module'
import { TodoExistsValidator } from './validators/todo-exists.validator'

@Module({
  imports: [PrismaModule],
  controllers: [TodosController],
  providers: [
    TodosService,
    TodoExistsValidator
  ],
  exports: [TodosService]
})
export class TodosModule {}
