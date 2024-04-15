import { Module } from '@nestjs/common'
import { BudgetsService } from './budgets.service'
import { BudgetsController } from './budgets.controller'
import { PrismaModule } from '../../prisma/prisma.module'
import { MongoModule } from '../../mongo/mongo.module'

@Module({
  imports: [PrismaModule, MongoModule],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}
