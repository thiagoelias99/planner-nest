import { Controller, Post, Body } from '@nestjs/common'
import { StocksService } from './stocks.service'
import { CreateStockDto } from './dto/create-stock.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Stock } from './stock.entity'

@Controller('stocks')
@ApiTags('Stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new stock' })
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: Stock,
  })
  create(@Body() createStockDto: CreateStockDto) {
    // return this.stocksService.createStock(createStockDto)
    return createStockDto
  }
}
