import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma-service.ts'
import { BudgetsRepository } from '../../../resources/budgets/budgets.repository'

@Injectable()
export class PrismaBudgetsRepository extends BudgetsRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }
}