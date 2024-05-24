import { Controller, UseGuards, Req, Get } from '@nestjs/common'
import { StocksService } from './stocks.service'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { StocksFromUserList } from './entities/stock.entity'
import { AuthGuard, UserRequest } from '../../guards/auth.guard'
import { StockHistorySummary } from './entities/history.entity'

@Controller('stocks')
@ApiTags('Stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) { }

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

    return data
  }

  @Get('history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stock History from User' })
  @ApiResponse({
    status: 200,
    description: 'Ok',
    type: StockHistorySummary,
  })
  async getStockHistoryFromUser(@Req() req: UserRequest) {
    const { id: userId } = req.user
    const month = new Date().getMonth()
    const year = new Date().getFullYear()

    const data = await this.stocksService.getCurrentHistoryFromTheMonth(userId, month, year)

    return data
  }
}
