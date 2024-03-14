import { ApiProperty } from '@nestjs/swagger'
import { IsString, Length } from 'class-validator'
import { IsUniqueStock } from '../validators/is-unique-stock.validator'
import { IsStockType } from '../validators/is-stock-type'

export class CreateStockDto {
  constructor(data: CreateStockDto) {
    Object.assign(this, data)
  }

  @IsString() @Length(1,10) @IsUniqueStock() @ApiProperty({example: 'PETR4'}) ticker: string
  @IsString() @IsStockType() type: string

  public static getMock(): CreateStockDto {
    const data = {
      ticker: 'PETR4',
      type: 'Ação'
    }
    return new CreateStockDto(data)
  }
}
