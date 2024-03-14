import { Module } from '@nestjs/common'
import { StocksService } from './stocks.service'
import { StocksController } from './stocks.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { IsStockTypeValidator } from './validators/is-stock-type'
import { IsUniqueStockValidator } from './validators/is-unique-stock.validator'

@Module({
  imports: [PrismaModule],
  controllers: [StocksController],
  providers: [
    StocksService,
    IsStockTypeValidator,
    IsUniqueStockValidator
  ],
  exports: [StocksService]
})
export class StocksModule {}
