import { Injectable } from '@nestjs/common'
import { BudgetsRepository } from './budgets.repository'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { randomUUID } from 'crypto'
import { BudgetPaymentMethodEnum } from './budgets.entity'

@Injectable()
export class BudgetsService {
  constructor(
    private readonly budgetsRepository: BudgetsRepository,
  ) { }

  async create(userId: string, data: CreateBudgetDto) {
    const createdBudget = await this.budgetsRepository.create({
      id: randomUUID(),
      userId,
      isRecurrent: !!data.startDate,
      description: data.description || 'Extra',
      expectedDay: data.expectedDay || data.startDate?.getDate() || new Date().getDate(),
      isIncome: data.isIncome || true,
      paymentMethod: data.paymentMethod || BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: !!data.consolidated,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate: data.startDate,
            endDate: data.endDate
          }
        ],
        registers: [
          {
            id: randomUUID(),
            value: data.value,
            date: data.startDate,
            checked: !!data.consolidated
          }
        ]
      }
    })

    console.log('Budget created:', createdBudget)

    return createdBudget
  }
}
