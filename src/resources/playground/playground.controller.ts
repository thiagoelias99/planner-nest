import { Body, Controller, Post } from '@nestjs/common'
import { PlaygroundService } from './playground.service'
import { CreateCatDto } from './dto/create-cat-dto'

@Controller('playground')
export class PlaygroundController {
  constructor(private readonly playgroundService: PlaygroundService) { }

  @Post('')
  async createCat(
    @Body() data: CreateCatDto,
  ) {
    return this.playgroundService.createCat(data)
  }
}
