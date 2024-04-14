import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma-service.ts'
import { BudgetsRepository } from 'src/resources/budgets/budgets.repository'

@Injectable()
export class PrismaBudgetsRepository extends BudgetsRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }
}