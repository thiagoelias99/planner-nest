import { Injectable } from '@nestjs/common'
import * as moment from 'moment'
import { BudgetsRepository } from './budgets.repository'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { randomUUID } from 'crypto'
import { Budget, BudgetPaymentMethodEnum, BudgetSimplified } from './budgets.entity'
import { GetBudgetQueryDto } from './dto/get-budget-query.dto'
import { BudgetSummary } from './dto/summary.dto'
import { UpdateBudgetRegisterDto } from './dto/update-register.dto'

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
            checked: consolidated,
            deleted: false
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

  async summary(userId: string, year: number, month: number) {
    let budgets = await this.find(userId, {
      month: month.toString(),
      year: year.toString()
    })

    //Verify in registers if already there date in the month, if not, create a register with the value and checked false
    await Promise.all(
      budgets.map(budget => {
        const registers = budget.recurrenceHistory.registers.filter(register => {
          return moment(register.date).month() === month && moment(register.date).year() === year
        })

        if (registers.length === 0) {
          return this.addRegister(budget.id, budget.currentValue, new Date(year, month, budget.expectedDay))
        } else {
          return
        }
      })
    )

    //Get updated budgets
    budgets = await this.find(userId, {
      month: month.toString(),
      year: year.toString()
    })

    const incomes = this.filterBudgets(budgets, month, year, true)
    const outcomes = this.filterBudgets(budgets, month, year, false)

    //Calculate summary
    //Budget Marked as credit should not be considered in the summary predicted and actual values
    const summary: BudgetSummary = {
      incomes,
      outcomes,
      predictedIncomeValue: incomes.reduce((acc, curr) => acc + (curr.deleted || (curr.paymentMethod === BudgetPaymentMethodEnum.CREDIT) ? 0 : curr.value), 0),
      predictedOutcomeValue: outcomes.reduce((acc, curr) => acc + (curr.deleted || (curr.paymentMethod === BudgetPaymentMethodEnum.CREDIT) ? 0 : curr.value), 0),
      predictedBalance: incomes.reduce((acc, curr) => acc + (curr.deleted || (curr.paymentMethod === BudgetPaymentMethodEnum.CREDIT) ? 0 : curr.value), 0) - outcomes.reduce((acc, curr) => acc + (curr.deleted || (curr.paymentMethod === BudgetPaymentMethodEnum.CREDIT) ? 0 : curr.value), 0),
      // actualIncomeValue: incomes.reduce((acc, curr) => acc + (curr.isChecked ? curr.value : 0), 0),
      actualIncomeValue: incomes.reduce((acc, curr) => acc + (curr.isChecked && !curr.deleted && curr.paymentMethod !== BudgetPaymentMethodEnum.CREDIT ? curr.value : 0), 0),
      actualOutcomeValue: outcomes.reduce((acc, curr) => acc + (curr.isChecked && !curr.deleted && curr.paymentMethod !== BudgetPaymentMethodEnum.CREDIT  ? curr.value : 0), 0),
      actualBalance: incomes.reduce((acc, curr) => acc + (curr.isChecked && !curr.deleted && curr.paymentMethod !== BudgetPaymentMethodEnum.CREDIT  ? curr.value : 0), 0) - outcomes.reduce((acc, curr) => acc + (curr.isChecked && !curr.deleted && curr.paymentMethod !== BudgetPaymentMethodEnum.CREDIT  ? curr.value : 0), 0)
    }

    return summary
  }

  async addRegister(budgetId: string, value: number, date: Date) {
    return this.budgetsRepository.addRegister(budgetId, value, date)
  }

  filterBudgets(budgets: Budget[], month: number, year: number, income: boolean) {
    const incomeBudgets = budgets.filter(budget => budget.isIncome === income)
    //Select register from selected date
    return incomeBudgets.map(budget => {
      const budgetFromThisMonth = budget.recurrenceHistory.registers.find(register => {
        return moment(register.date).month() === month && moment(register.date).year() === year
      })

      const simplified: BudgetSimplified = {
        id: budgetFromThisMonth.id,
        parentId: budget.id,
        description: budget.description,
        value: budgetFromThisMonth.value,
        date: budgetFromThisMonth.date,
        isChecked: budgetFromThisMonth.consolidated,
        paymentMethod: budget.paymentMethod,
        deleted: budgetFromThisMonth.deleted
      }

      return simplified
    })
  }

  async updateBudgetRegister(userId: string,budgetId: string, registerId: string, data: UpdateBudgetRegisterDto) {
    return this.budgetsRepository.updateBudgetRegister(userId, budgetId, registerId, data)
  }
}
