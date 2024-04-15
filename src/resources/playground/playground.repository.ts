import { CreateCatDto } from './dto/create-cat-dto'
import { Cat } from './playground.entity'

export abstract class PlaygroundNoSQLRepository {
  abstract createCat(data: CreateCatDto): Promise<Cat>
}