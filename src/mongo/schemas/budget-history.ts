import { Schema } from 'mongoose'
import { Budget } from 'src/resources/budgets/budgets.entity'

interface IMongoBudgetHistorySchema extends Budget {
  _id: string
}

export const budgetHistorySchema = new Schema<IMongoBudgetHistorySchema>(
  {
    _id: { type: String, required: true },
    description: { type: String, required: true },
    currentValue: { type: Number, required: true },
    expectedDay: { type: Number, required: true },
    isRecurrent: { type: Boolean, required: true },
    paymentMethod: { type: String },
    recurrenceHistory: {
      active: [
        {
          startDate: { type: Date, required: true },
          endDate: { type: Date }
        }
      ],
      registers: [
        {
          id: { type: String, required: true },
          value: { type: Number, required: true },
          date: { type: Date, required: true },
          checked: { type: Boolean, required: true }
        }
      ]
    }
  },
  {
    versionKey: false
  }
)