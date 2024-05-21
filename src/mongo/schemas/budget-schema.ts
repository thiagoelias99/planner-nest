import { Schema } from 'mongoose'
import { Budget } from 'src/resources/budgets/budgets.entity'

// TODO: Remove comments

export interface IMongoBudgetSchema extends Budget {
  _id: string
}

export const budgetSchema = new Schema<IMongoBudgetSchema>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    description: { type: String, required: true },
    currentValue: { type: Number, required: true },
    expectedDay: { type: Number, required: true },
    isRecurrent: { type: Boolean, required: true },
    // isIncome: { type: Boolean, required: true },
    budgetClass: { type: String, required: true },
    paymentMethod: { type: String },
    recurrenceHistory: {
      activePeriods: [
        {
          startDate: { type: Date },
          endDate: { type: Date }
        }
      ],
      registers: [
        {
          id: { type: String, required: true },
          value: { type: Number, required: true },
          date: { type: Date, required: false },
          checked: { type: Boolean, required: true },
          deleted: { type: Boolean, required: true}
        }
      ]
    }
  },
  {
    versionKey: false
  }
)