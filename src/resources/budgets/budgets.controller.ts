import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { BudgetsService } from './budgets.service'
import { Budget } from './budgets.entity'
import { AuthGuard, UserRequest } from 'src/guards/auth.guard'
import { CreateBudgetDto } from './dto/create-budget.dto'

@Controller('budgets')
@ApiTags('Budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) { }

  @Post('')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new budget', description: 'Only value is required, all the other fields are optionals.'})
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: Budget
  })
  async create(@Req() req: UserRequest, @Body() data: CreateBudgetDto) {

    return {
      userName: req.user.name,
      ...data
    }
  }
}
