import { Injectable } from '@nestjs/common'
import { BudgetCreateDto, BudgetsRepository } from '../../../resources/budgets/budgets.repository'
import { Budget } from '../../../resources/budgets/budgets.entity'

@Injectable()
export class MongoBudgetsRepository extends BudgetsRepository {
  create(data: BudgetCreateDto): Promise<Budget> {
    throw new Error('Method not implemented.')
  }

}