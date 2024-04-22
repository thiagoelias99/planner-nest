import { ApiProperty } from '@nestjs/swagger'
import { BudgetSimplified } from '../budgets.entity'

export class BudgetSummary {
  @ApiProperty({ type: [BudgetSimplified] }) incomes: BudgetSimplified[]
  @ApiProperty({ type: [BudgetSimplified] }) outcomes: BudgetSimplified[]
  @ApiProperty() predictedIncomeValue: number
  @ApiProperty() predictedOutcomeValue: number
  @ApiProperty() predictedBalance: number
  @ApiProperty() actualIncomeValue: number
  @ApiProperty() actualOutcomeValue: number
  @ApiProperty() actualBalance: number
}