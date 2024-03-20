import { Controller, UseGuards, Req, Get } from '@nestjs/common'
import { StocksService } from './stocks.service'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { StocksFromUserList } from './stock.entity'
import { AuthGuard, UserRequest } from 'src/guards/auth.guard'

@Controller('stocks')
@ApiTags('Stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) { }

  // @Post()
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Create a new stock' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Created',
  //   type: Stock,
  // })
  // create(@Req() req: UserRequest, @Body() createStockDto: CreateStockDto) {
  // const { id: userId } = req.user
  // return this.stocksService.createStock(createStockDto)
  //   return createStockDto
  // }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stock from User' })
  @ApiResponse({
    status: 200,
    description: 'Ok',
    type: StocksFromUserList,
  })
  async getCurrentStocksFromUser(@Req() req: UserRequest) {
    const { id: userId } = req.user
    const data = await this.stocksService.getCurrentStocksFromUser(userId)

    // Delete orderGroup
    data.stocks.forEach(stock => {
      delete stock.orderGroup
    })

    return data
  }
}
