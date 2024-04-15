export interface IBudgetItem {
  id: string
  isIncome: boolean
}

export interface IBudgetHistory {
  description: string
  currentValue: number
  expectedDay: number
  isRecurrent: boolean
  paymentMethod?: BudgetPaymentMethodEnum
  recurrenceHistory?: {
    active: {
      startDate: Date
      endDate?: Date
    }[]
    registers: {
      id: string
      value: number
      date: Date
      checked: boolean
    }
  }
}

export interface IBudget extends IBudgetItem, IBudgetHistory { }

export enum BudgetPaymentMethodEnum {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
}