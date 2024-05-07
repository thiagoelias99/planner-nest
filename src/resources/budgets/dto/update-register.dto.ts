/* eslint-disable indent */

import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsDateString, IsNumber, IsOptional, Min } from 'class-validator'

export class UpdateBudgetRegisterDto {
  @IsNumber()
  @Min(0)
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