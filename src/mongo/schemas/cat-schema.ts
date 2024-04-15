import { Schema } from 'mongoose'
import { Cat } from '../../resources/playground/playground.entity'

export interface IMongoCatSchema extends Omit<Cat, 'id'> {
  _id: string
}

export const catSchema = new Schema<IMongoCatSchema>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
  },
  {
    versionKey: false
  }
)