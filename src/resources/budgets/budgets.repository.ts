import { CreateBudgetDto } from './dto/create-budget.dto'
import { Budget } from './budgets.entity'

export interface BudgetCreateDto extends CreateBudgetDto {
  id: string
  userId: string
}

export abstract class BudgetsRepository {
  abstract create(data: BudgetCreateDto): Promise<Budget>
}