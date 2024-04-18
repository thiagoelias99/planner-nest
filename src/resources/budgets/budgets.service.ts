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
    let startDate: Date | undefined
    let expectedDay: number

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

    // Normalize startDate
    if (data.startDate) {
      startDate = new Date(data.startDate)
    }

    // Normalize expectedDay
    if (data.expectedDay) {
      expectedDay = data.expectedDay
    } else if (startDate) {
      expectedDay = startDate.getDate()
    } else {
      expectedDay = new Date().getDate()
    }

    console.log('Creating budget with data:', data.startDate)

    const createdBudget = await this.budgetsRepository.create({
      id: randomUUID(),
      userId,
      isRecurrent: !!data.startDate,
      description: data.description || 'Extra',
      expectedDay: expectedDay,
      isIncome,
      paymentMethod: data.paymentMethod || BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: consolidated,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate: startDate,
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
