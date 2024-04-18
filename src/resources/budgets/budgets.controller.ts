import { BadRequestException, Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { BudgetsService } from './budgets.service'
import { Budget } from './budgets.entity'
import { AuthGuard, UserRequest } from '../../guards/auth.guard'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { GetBudgetQueryDto } from './dto/get-budget-query.dto'

@Controller('budgets')
@ApiTags('Budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) { }

  @Post('')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new budget', description: 'Only value is required, all the other fields are optionals.' })
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: Budget
  })
  async create(@Req() req: UserRequest, @Body() data: CreateBudgetDto) {

    //Return bad request if endDate is before startDate
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new BadRequestException('End date must be after start date')
    }

    //Return bad request if endDate is provided without startDate
    if (!data.startDate && data.endDate) {
      throw new BadRequestException('End date must be provided with start date')
    }

    return this.budgetsService.create(req.user.id, data)
  }

  @Get('')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get budgets from user' })
  @ApiResponse({
    status: 200,
    description: 'Ok',
    type: [Budget]
  })
  async find(
    @Req() req: UserRequest,
    @Query() query: GetBudgetQueryDto
  ) {
    return this.budgetsService.find(req.user.id)
  }
}
