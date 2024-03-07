import { Module } from '@nestjs/common'
import { PrismaService } from './prisma-service.ts'

import { PrismaUserRepository } from './repositories/User/prisma-users.repository'
import { UsersRepository } from '../resources/users/users.repository'
import { TodosRepository } from '../resources/todos/todos.repository'
import { PrismaTodosRepository } from './repositories/Todo/prisma-todos.repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUserRepository
    },
    {
      provide: TodosRepository,
      useClass: PrismaTodosRepository
    }
  ],
  exports: [
    PrismaService,
    UsersRepository,
    TodosRepository
  ]
})
export class PrismaModule { }