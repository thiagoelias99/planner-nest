import { Injectable } from '@nestjs/common'
import * as moment from 'moment'
import { BudgetsRepository } from './budgets.repository'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { randomUUID } from 'crypto'
import { Budget, BudgetClassEnum, BudgetPaymentMethodEnum, BudgetSimplified } from './budgets.entity'
import { GetBudgetQueryDto } from './dto/get-budget-query.dto'
import { BudgetSummary } from './dto/summary.dto'
import { UpdateBudgetRegisterDto } from './dto/update-register.dto'

// TODO: Remove comments

@Injectable()
export class BudgetsService {
  constructor(
    private readonly budgetsRepository: BudgetsRepository,
  ) { }

  async create(userId: string, data: CreateBudgetDto) {
    let consolidated: boolean = true
    let startDate: Date | undefined
    let expectedDay: number

    // Normalize isIncome
    // if (data.isIncome === undefined) {
    //   isIncome = true
    // } else {
    //   isIncome = data.isIncome
    // }

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
      budgetClass: data.budgetClass,
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

    //Calculate summary
    //Budget Marked as credit should not be considered in the summary predicted and actual values

    const incomes = this.filterBudgets(budgets, month, year, BudgetClassEnum.INCOME)
    const outcomes = this.filterBudgets(budgets, month, year, BudgetClassEnum.EXPENSE)
    const creditCards = this.filterBudgets(budgets, month, year, BudgetClassEnum.CREDIT_CARD)
    const pensions = this.filterBudgets(budgets, month, year, BudgetClassEnum.PENSION)
    const investments = this.filterBudgets(budgets, month, year, BudgetClassEnum.INVESTMENT)
    const cashBoxes = this.filterBudgets(budgets, month, year, BudgetClassEnum.CASH_BOX)

    // Income
    const predictedIncomeValue = incomes.reduce((acc, curr) => acc + (curr.deleted || (curr.paymentMethod === BudgetPaymentMethodEnum.CREDIT) ? 0 : curr.value), 0)
    const actualIncomeValue = incomes.reduce((acc, curr) => acc + (curr.isChecked && !curr.deleted && curr.paymentMethod !== BudgetPaymentMethodEnum.CREDIT ? curr.value : 0), 0)

    // Outcome
    const actualOutcomeValue = outcomes.reduce((acc, curr) => acc + (curr.isChecked && !curr.deleted && curr.paymentMethod !== BudgetPaymentMethodEnum.CREDIT ? curr.value : 0), 0)
    const predictedOutcomeValue = outcomes.reduce((acc, curr) => acc + (curr.deleted || (curr.paymentMethod === BudgetPaymentMethodEnum.CREDIT) ? 0 : curr.value), 0)

    // Credit
    const actualCreditValue = creditCards.reduce((acc, curr) => acc + (curr.isChecked && !curr.deleted ? curr.value : 0), 0)
    const creditLimitValue = calculateCreditLimit(actualIncomeValue, predictedOutcomeValue, 0.25)

    const _actualBalance = actualIncomeValue - actualOutcomeValue - actualCreditValue

    // Pension
    const actualPensionValue = pensions.reduce((acc, curr) => acc + (curr.isChecked && !curr.deleted ? curr.value : 0), 0)
    const predictedPensionValue = calculateValueFromActualBalance(_actualBalance, 0.08)

    // Investments
    const actualInvestmentsValue = investments.reduce((acc, curr) => acc + (curr.isChecked && !curr.deleted ? curr.value : 0), 0)
    const predictedInvestmentsValue = calculateValueFromActualBalance(_actualBalance, 0.65)

    // Cash Box
    const actualCashBoxValue = cashBoxes.reduce((acc, curr) => acc + (curr.isChecked && !curr.deleted ? curr.value : 0), 0)
    const predictedCashBoxValue = calculateValueFromActualBalance(_actualBalance, 0.27)

    // Balance
    const predictedBalance = predictedIncomeValue - predictedOutcomeValue - creditLimitValue - predictedPensionValue - predictedInvestmentsValue - predictedCashBoxValue
    const actualBalance = actualIncomeValue - actualOutcomeValue - actualCreditValue - actualPensionValue - actualInvestmentsValue - actualCashBoxValue

    const summary: BudgetSummary = {
      incomes,
      outcomes,
      creditCards,
      pensions,
      investments,
      cashBoxes,
      predictedIncomeValue,
      predictedOutcomeValue,
      predictedBalance,
      actualIncomeValue,
      actualOutcomeValue,
      actualBalance,
      actualCreditValue,
      creditLimitValue,
      actualPensionValue,
      predictedPensionValue,
      actualInvestmentsValue,
      predictedInvestmentsValue,
      actualCashBoxValue,
      predictedCashBoxValue
    }

    return summary
  }

  async addRegister(budgetId: string, value: number, date: Date) {
    return this.budgetsRepository.addRegister(budgetId, value, date)
  }

  // filterBudgets(budgets: Budget[], month: number, year: number, income: boolean) {
  filterBudgets(budgets: Budget[], month: number, year: number, budgetClass: BudgetClassEnum) {
    const incomeBudgets = budgets.filter(budget => budget.budgetClass === budgetClass)
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

  async updateBudgetRegister(userId: string, budgetId: string, registerId: string, data: UpdateBudgetRegisterDto) {
    return this.budgetsRepository.updateBudgetRegister(userId, budgetId, registerId, data)
  }
}

function calculateCreditLimit(actualIncomeValue: number, predictedOutcomeValue: number, creditPercent: number) {
  const maxExpenseLimit = actualIncomeValue * creditPercent
  const creditLimit = maxExpenseLimit - predictedOutcomeValue
  return creditLimit > 0 ? creditLimit : 0
}

function calculateValueFromActualBalance(actualBalance: number, percent: number) {
  return actualBalance > 0 ? actualBalance * percent : 0
}