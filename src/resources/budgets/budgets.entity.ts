import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

// TODO: Remove comments

export enum BudgetPaymentMethodEnum {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  PIX = 'PIX',
  TRANSFER = 'TRANSFER'
}

export enum BudgetClassEnum {
  INCOME = 'income',
  EXPENSE = 'expense',
  CREDIT_CARD = 'creditCard',
  PENSION = 'pension',
  INVESTMENT = 'investment',
  CASH_BOX = 'cashBox'
}

export class ActiveHistory {
  @ApiProperty({ example: new Date().toISOString() }) startDate: Date
  @ApiProperty({ example: new Date().toISOString(), required: false }) endDate?: Date

  public static mock(): ActiveHistory {
    const data = {
      startDate: new Date('2024-02-15T00:00:00.000Z'),
      endDate: new Date('2024-04-18T00:00:00.000Z')
    }
    return data as ActiveHistory
  }
}

export class Register {
  @ApiProperty({ example: '21f58a70-3d62-4524-b564-3464d85e9e0d' }) id: string
  @ApiProperty({ example: 19.99 }) value: number
  @ApiProperty({ example: new Date().toISOString() }) date: Date
  @ApiProperty({ example: true }) consolidated: boolean
  @ApiProperty() deleted: boolean

  public static mock(): Register {
    const data = {
      id: '21f58a70-3d62-4524-b564-3464d85e9e0d',
      value: 19.99,
      date: new Date('2024-02-15T00:00:00.000Z'),
      consolidated: true,
      deleted: false
    }
    return data as Register
  }
}

export class RecurrenceHistory {
  @ApiProperty({ example: [ActiveHistory.mock()], type: [ActiveHistory] }) activePeriods: ActiveHistory[]
  @ApiProperty({ example: [Register.mock()], type: [Register] }) registers: Register[]
}

export class Budget {
  @ApiProperty({ example: '21f58a70-3d62-4524-b564-3464d85e9e0d' }) id: string
  @Exclude() userId: string
  // @ApiProperty({ example: false }) isIncome: boolean
  @ApiProperty({ example: BudgetClassEnum.INCOME, enum: BudgetClassEnum, required: true }) budgetClass: BudgetClassEnum
  @ApiProperty({ example: 'Salary' }) description: string
  @ApiProperty({ example: 1000 }) currentValue: number
  @ApiProperty({ example: 1 }) expectedDay: number
  @ApiProperty({ example: true }) isRecurrent: boolean
  @ApiProperty({ example: BudgetPaymentMethodEnum.CREDIT, enum: BudgetPaymentMethodEnum, required: false, default: BudgetPaymentMethodEnum.DEBIT }) paymentMethod?: BudgetPaymentMethodEnum
  @ApiProperty({ type: RecurrenceHistory }) recurrenceHistory?: RecurrenceHistory

  constructor(data: Budget) {
    Object.assign(this, data)
  }

  public static mock(): Budget {
    const data = {
      id: '21f58a70-3d62-4524-b564-3464d85e9e0d',
      // isIncome: false,
      budgetClass: BudgetClassEnum.INCOME,
      description: 'Salary',
      currentValue: 1000,
      expectedDay: 1,
      isRecurrent: true,
      paymentMethod: BudgetPaymentMethodEnum.CREDIT,
      recurrenceHistory: {
        activePeriods: [ActiveHistory.mock()],
        registers: [Register.mock()]
      }
    }
    return data as Budget
  }
}

export class BudgetSimplified{
  @ApiProperty() id: string
  @ApiProperty() parentId: string
  @ApiProperty() description: string
  @ApiProperty() value: number
  @ApiProperty({ example: new Date().toISOString() }) date: Date
  @ApiProperty() isChecked: boolean
  @ApiProperty({ enum: BudgetPaymentMethodEnum}) paymentMethod: BudgetPaymentMethodEnum
  @ApiProperty() deleted: boolean
}