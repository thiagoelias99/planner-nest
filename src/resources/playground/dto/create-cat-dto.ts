import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class CreateCatDto {
  @IsString() @ApiProperty({ example: 'Fluffy' }) name: string
  @IsNumber() @ApiProperty({ example: 3 }) age: number
}