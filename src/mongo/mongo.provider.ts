import * as mongoose from 'mongoose'
import { PlaygroundNoSQLRepository } from '../resources/playground/playground.repository'
import { MongoPlaygroundRepository } from './repositories/Playground/mongo-playground.repository'

export const mongoProvider = [
  {
    provide: 'MONGO_DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(process.env.MONGO_DATABASE_URL),
  },
  {
    provide: PlaygroundNoSQLRepository,
    useClass: MongoPlaygroundRepository,
  }
]