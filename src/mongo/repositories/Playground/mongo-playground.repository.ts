import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Connection } from 'mongoose'
import { IMongoCatSchema, catSchema } from '../../schemas/cat-schema'
import { CreateCatDto } from '../../../resources/playground/dto/create-cat-dto'
import { Cat } from '../../../resources/playground/playground.entity'
import { PlaygroundNoSQLRepository } from '../../../resources/playground/playground.repository'

@Injectable()
export class MongoPlaygroundRepository extends PlaygroundNoSQLRepository {
  constructor(@Inject('MONGO_DATABASE_CONNECTION') private readonly mongo: Connection) {
    super()    
  }

  //Define models
  private catModel = this.mongo.model<IMongoCatSchema>('cats', catSchema)

  async createCat(data: CreateCatDto): Promise<Cat> {
    const id = randomUUID()
    const newCat = await this.catModel.create({...data, _id: id})

    return {
      id: newCat._id,
      name: newCat.name,
      age: newCat.age,
    }
  }
}