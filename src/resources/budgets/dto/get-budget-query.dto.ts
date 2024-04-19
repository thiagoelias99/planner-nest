/* eslint-disable indent */
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export enum MonthsEnum {
  January = '0',
  February = '1',
  March = '2',
  April = '3',
  May = '4',
  June = '5',
  July = '6',
  August = '7',
  September = '8',
  October = '9',
  November = '10',
  December = '11'
}

export class GetBudgetQueryDto {
  @IsEnum(MonthsEnum)
  @IsOptional()
  @ApiProperty({ enum: MonthsEnum, required: false })
  month?: string

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '2024', required: false })
  year?: string
}

