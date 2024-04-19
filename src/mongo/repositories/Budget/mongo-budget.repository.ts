import { Inject, Injectable } from '@nestjs/common'
import { Connection } from 'mongoose'
import { BudgetCreateDto, BudgetsRepository } from '../../../resources/budgets/budgets.repository'
import { Budget } from '../../../resources/budgets/budgets.entity'
import { IMongoBudgetSchema, budgetSchema } from '../../schemas/budget-schema'

@Injectable()
export class MongoBudgetsRepository extends BudgetsRepository {
  constructor(@Inject('MONGO_DATABASE_CONNECTION') private readonly mongo: Connection) {
    super()
  }

  private budgetModel = this.mongo.model<IMongoBudgetSchema>('budgets', budgetSchema)

  async create(data: BudgetCreateDto): Promise<Budget> {
    try {
      const createdBudget = (await this.budgetModel.create({ ...data, _id: data.id, currentValue: data.value })).toJSON()
      createdBudget.id = createdBudget._id
      delete createdBudget._id

      return new Budget({
        ...createdBudget,
        recurrenceHistory: {
          activePeriods: createdBudget.recurrenceHistory.activePeriods.map((activePeriod: any) => ({
            startDate: activePeriod.startDate,
            endDate: activePeriod.endDate
          })),
          registers: createdBudget.recurrenceHistory.registers.map((register: any) => ({
            id: register.id,
            value: register.value,
            date: register.date,
            consolidated: register.checked
          }))
        }
      })

    } catch (error) {
      console.error('Error creating budget:', error)
      throw error
    }
  }

  async find(userId: string): Promise<Budget[]> {
    try {
      const budgets = await this.budgetModel.find({ userId }).lean()

      return budgets.map((budget: any) => new Budget({
        ...budget,
        id: budget._id,
        recurrenceHistory: {
          activePeriods: budget.recurrenceHistory.activePeriods.map((activePeriod: any) => ({
            startDate: activePeriod.startDate,
            endDate: activePeriod.endDate
          })),
          registers: budget.recurrenceHistory.registers.map((register: any) => ({
            id: register.id,
            value: register.value,
            date: register.date,
            consolidated: register.checked
          }))
        }
      }))

    } catch (error) {
      console.error('Error getting budget:', error)
      throw error
    }
  }

  async deleteBudgets(ids: string[]): Promise<any> {
    try {
      return this.budgetModel.deleteMany({
        _id: {
          $in: ids
        }
      })
    } catch (error) {
      console.error('Error getting budget:', error)
      throw error
    }
  }
}