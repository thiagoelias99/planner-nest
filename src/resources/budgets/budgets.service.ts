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
    let isIncome: boolean = true
    let consolidated: boolean = true

    // Normalize isIncome
    if (data.isIncome === undefined) {
      isIncome = true
    } else {
      isIncome = data.isIncome
    }

    // Normalize consolidated
    if (data.consolidated === undefined) {
      consolidated = true
    } else {
      consolidated = data.consolidated
    }

    const createdBudget = await this.budgetsRepository.create({
      id: randomUUID(),
      userId,
      isRecurrent: !!data.startDate,
      description: data.description || 'Extra',
      expectedDay: data.expectedDay || data.startDate?.getDate() || new Date().getDate(),
      isIncome,
      paymentMethod: data.paymentMethod || BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: consolidated,
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
            date: data.startDate || new Date(),
            checked: consolidated
          }
        ]
      }
    })

    return createdBudget
  }
}
