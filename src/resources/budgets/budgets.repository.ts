import { CreateBudgetDto } from './dto/create-budget.dto'
import { Budget } from './budgets.entity'

export interface BudgetCreateDto extends CreateBudgetDto {
  id: string
  userId: string
  isRecurrent: boolean
  recurrenceHistory : {
    activePeriods: [
      {
        startDate?: Date,
        endDate?: Date
      }
    ],
    registers: [
      {
        id: string,
        value: number,
        date?: Date,
        checked: boolean
      }
    ]
  }
}

export abstract class BudgetsRepository {
  abstract create(data: BudgetCreateDto): Promise<Budget>
  abstract find(userId: string): Promise<Budget[]>
  abstract deleteBudgets(ids: string[]): Promise<any>
  abstract addRegister(budgetId: string, value: number, date: Date): Promise<string>
}