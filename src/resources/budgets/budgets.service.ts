import { Injectable } from '@nestjs/common'
import * as moment from 'moment'
import { BudgetsRepository } from './budgets.repository'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { randomUUID } from 'crypto'
import { BudgetPaymentMethodEnum } from './budgets.entity'
import { GetBudgetQueryDto } from './dto/get-budget-query.dto'

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

  async find(userId: string, { month, year }: GetBudgetQueryDto) {
    const budgets = await this.budgetsRepository.find(userId)

    if (!month) {
      return budgets
    }

    // Filter by month and year
    let normalizedMonth: Number = parseInt(month) + 1
    let normalizedYear = new Date().getFullYear()

    if (year) {
      normalizedYear = parseInt(year)
    }

    const firstMonthDay = moment(`${normalizedYear}-${normalizedMonth}-01`, 'YYYY-MM-DD')
    const lastMonthDay = firstMonthDay.clone().endOf('month')

    return budgets.filter(budget => {
      const hasRegister = budget.recurrenceHistory.registers.some(register => {
        return moment(register.date).isBetween(firstMonthDay, lastMonthDay)
      })

      const hasActivePeriod = budget.recurrenceHistory.activePeriods.some(period => {
        if (!period.startDate) {
          return false
        }

        return moment(period.startDate).isBefore(lastMonthDay) && (!period.endDate || moment(period.endDate).isAfter(firstMonthDay))
      })

      return hasRegister || hasActivePeriod
    })
  }

  async deleteBudgets(ids: string[]) {
    return this.budgetsRepository.deleteBudgets(ids)
  }
}
