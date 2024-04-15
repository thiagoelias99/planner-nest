import { Module } from '@nestjs/common'
import { PlaygroundService } from './playground.service'
import { PlaygroundController } from './playground.controller'
import { MongoModule } from 'src/mongo/mongo.module'

@Module({
  imports: [MongoModule],
  controllers: [PlaygroundController],
  providers: [PlaygroundService],
})
export class PlaygroundModule {}
