import { Module } from '@nestjs/common'
import { PrismaService } from './prisma-service.ts'

import { PrismaUserRepository } from './repositories/User/prisma-users.repository'
import { UsersRepository } from '../resources/users/users.repository'
import { TodosRepository } from '../resources/todos/todos.repository'
import { PrismaTodosRepository } from './repositories/Todo/prisma-todos.repository'
import { StocksRepository } from '../resources/stocks/stocks.repository'
import { PrismaStocksRepository } from './repositories/Stock/prisma-stocks.repository'
import { BudgetsRepository } from '../resources/budgets/budgets.repository'
import { PrismaBudgetsRepository } from './repositories/Budget/prisma-budgets.repository'

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
    },
    {
      provide: StocksRepository,
      useClass: PrismaStocksRepository
    },
    {
      provide: BudgetsRepository,
      useClass: PrismaBudgetsRepository
    }
  ],
  exports: [
    PrismaService,
    UsersRepository,
    TodosRepository,
    StocksRepository,
    BudgetsRepository
  ]
})
export class PrismaModule { }