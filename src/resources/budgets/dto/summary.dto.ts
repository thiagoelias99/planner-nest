import { ApiProperty } from '@nestjs/swagger'
import { BudgetSimplified } from '../budgets.entity'

export class BudgetSummary {  
  @ApiProperty({ type: [BudgetSimplified] }) incomes: BudgetSimplified[]
  @ApiProperty() predictedIncomeValue: number
  @ApiProperty() actualIncomeValue: number
  
  @ApiProperty({ type: [BudgetSimplified] }) outcomes: BudgetSimplified[]
  @ApiProperty() predictedOutcomeValue: number
  @ApiProperty() actualOutcomeValue: number
  
  @ApiProperty() predictedBalance: number
  @ApiProperty() actualBalance: number
  
  @ApiProperty({ type: [BudgetSimplified] }) creditCards: BudgetSimplified[]
  @ApiProperty() actualCreditValue: number
  @ApiProperty() creditLimitValue: number
  
  @ApiProperty({ type: [BudgetSimplified] }) pensions: BudgetSimplified[]
  @ApiProperty() predictedPensionValue: number
  @ApiProperty() actualPensionValue: number
  
  @ApiProperty({ type: [BudgetSimplified] }) investments: BudgetSimplified[]
  @ApiProperty() predictedInvestmentsValue: number
  @ApiProperty() actualInvestmentsValue: number

  @ApiProperty({ type: [BudgetSimplified] }) cashBoxes: BudgetSimplified[]
  @ApiProperty() predictedCashBoxValue: number
  @ApiProperty() actualCashBoxValue: number
}