/* eslint-disable indent */

import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsPositive } from 'class-validator'

export class UpdateBudgetRegisterDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({ required: false })
  value?: number

  @IsDateString()
  @IsOptional()
  @ApiProperty({ required: false })
  date?: Date

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  checked?: boolean

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  deleted?: boolean
}