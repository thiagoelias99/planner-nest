import { Injectable } from '@nestjs/common'
import { BudgetsRepository } from './budgets.repository'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class BudgetsService {
  constructor(
    private readonly budgetsRepository: BudgetsRepository,
  ) { }

  async create(userId: string, data: CreateBudgetDto) {
    return await this.budgetsRepository.create({
      id: randomUUID(),
      userId,
      ...data
    })
  }
}
