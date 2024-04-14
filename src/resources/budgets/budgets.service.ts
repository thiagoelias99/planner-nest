import { Injectable } from '@nestjs/common'
import { BudgetsRepository } from './budgets.repository'

@Injectable()
export class BudgetsService {
  constructor(private readonly budgetsRepository: BudgetsRepository) { }
}
