// cmd: npx ts-node mongo/fix_is-income.ts

import mongoose from 'mongoose'
import { BudgetClassEnum } from '../src/resources/budgets/budgets.entity'

// const connString = process.env.MONGO_DATABASE_URL
const connString = 'mongodb://localhost:27017/planner_nest'

// Look for budget records with isIncome and update to BudgetClassEnum
const fixIsIncome = async () => {
  const conn = await mongoose.connect(connString)
  const db = conn.connection.db
  const collection = db.collection('budgets')

  console.log('Looking for budgets without isIncome field')
  const cursor = collection.find({ isIncome: { $exists: true } })
  const budgets = await cursor.toArray()
  console.log(`Found ${budgets.length} budgets with isIncome field`)
  console.log('Adding budgetClass field to budgets')
  const updatePromises = budgets.map(budget => {
    const isIncome = budget.isIncome
    const budgetClass = isIncome ? BudgetClassEnum.INCOME : BudgetClassEnum.EXPENSE
    return collection.updateOne({ _id: budget._id }, { $set: { budgetClass } })
  })
  await Promise.all(updatePromises)
  console.log('Finished updating budgets')
  console.log('Dropping isIncome field')
  await collection.updateMany({}, { $unset: { isIncome: '' } })
  console.log('Finished dropping isIncome field')

  conn.disconnect()
}

fixIsIncome()