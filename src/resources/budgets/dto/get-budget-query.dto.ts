/* eslint-disable indent */
import { IsEnum, IsOptional } from 'class-validator'

export enum MonthsEnum {
  January = '00',
  February = '01',
  March = '02',
  April = '03',
  May = '04',
  June = '05',
  July = '06',
  August = '07',
  September = '08',
  October = '09',
  November = '10',
  December = '11'
}

export class GetBudgetQueryDto {
  @IsEnum(MonthsEnum)
  @IsOptional()
  month?: string
}

