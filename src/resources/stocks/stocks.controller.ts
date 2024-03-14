import { Controller, Post, Body } from '@nestjs/common'
import { StocksService } from './stocks.service'
import { CreateStockDto } from './dto/create-stock.dto'

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) { }

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stocksService.createStock(createStockDto)
  }
}
