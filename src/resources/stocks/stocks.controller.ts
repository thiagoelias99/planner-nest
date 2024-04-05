import { Controller, UseGuards, Req, Get } from '@nestjs/common'
import { StocksService } from './stocks.service'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { StocksFromUserList } from './stock.entity'
import { AuthGuard, UserRequest } from 'src/guards/auth.guard'

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
}
