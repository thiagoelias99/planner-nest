import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { BudgetsService } from './budgets.service'
import { Budget } from './budgets.entity'
import { AuthGuard, UserRequest } from '../../guards/auth.guard'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { GetBudgetQueryDto } from './dto/get-budget-query.dto'
import { BudgetSummary } from './dto/summary.dto'

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
    return this.budgetsService.find(req.user.id, query)
  }

  @Get('summary/:year/:month')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get summary of budgets from user by year and month' })
  @ApiResponse({
    status: 200,
    description: 'Ok',
    type: BudgetSummary
  })
  async summary(
    @Req() req: UserRequest,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    //Check if year is valid
    if (year < 1900 || year > 2100 || !year) {
      throw new BadRequestException('Year must be between 1900 and 2100')
    }

    //Check if month is valid
    if (month < 0 || month > 11 || !month) {
      throw new BadRequestException('Month must be between 0 and 11')
    }

    return { year, month }
  }
}
