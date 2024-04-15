import { Injectable } from '@nestjs/common'
import { CreateCatDto } from './dto/create-cat-dto'
import { PlaygroundNoSQLRepository } from './playground.repository'

@Injectable()
export class PlaygroundService {
  constructor(private readonly playgroundNoSqlRepository: PlaygroundNoSQLRepository) { }

  async createCat(data: CreateCatDto) {
    return this.playgroundNoSqlRepository.createCat(data)
  }
}
