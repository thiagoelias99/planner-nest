/* eslint-disable indent */
import { ApiProperty } from '@nestjs/swagger'
import { BudgetClassEnum, BudgetPaymentMethodEnum } from '../budgets.entity'
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator'

// TODO: Remove comments

export class CreateBudgetDto {
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 1999.99, required: true })
  value: number

  // @IsBoolean()
  // @IsOptional()
  // @ApiProperty({ required: false, default: true })
  // isIncome?: boolean
  @IsEnum(BudgetClassEnum)
  @ApiProperty({ enum: BudgetClassEnum, required: true })
  budgetClass: BudgetClassEnum

  @IsString()
  @Length(1, 156)
  @IsOptional()
  @ApiProperty({ example: 'Salary', required: false, default: 'Extra' })
  description?: string

  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  @ApiProperty({ required: false, default: 1 })
  expectedDay?: number

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: true })
  consolidated?: boolean

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false, default: null })
  startDate?: Date

  @IsDateString()
  @IsOptional()
  @ApiProperty({ example: new Date().toISOString(), required: false, default: null })
  endDate?: Date

  @IsEnum(BudgetPaymentMethodEnum)
  @IsOptional()
  @ApiProperty({ enum: BudgetPaymentMethodEnum, required: false, default: BudgetPaymentMethodEnum.DEBIT })
  paymentMethod?: BudgetPaymentMethodEnum

  public static mock(): CreateBudgetDto {
    return {
      value: 1999.99,
      // isIncome: true,
      budgetClass: BudgetClassEnum.INCOME,
      description: 'Salary',
      expectedDay: 1,
      consolidated: true,
      startDate: new Date(),
      endDate: new Date(),
      paymentMethod: BudgetPaymentMethodEnum.DEBIT
    }
  }
}