import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsString, Length } from 'class-validator'
import { faker } from '@faker-js/faker'

export class CreateTodoDto {
  @IsString() @Length(3, 30) @ApiProperty({ example: 'Wash your face' }) title: string
  @IsString() @Length(3, 255) @IsOptional() @ApiProperty({ example: 'Wash my face at every morning' }) description?: string
  @IsDateString() @IsOptional() @ApiProperty({ example: '1989-05-09T17:57:34.000Z' }) date: Date

  constructor(data: CreateTodoDto) {
    Object.assign(this, data)
  }

  public static getMock(): CreateTodoDto {
    const data = {
      title: faker.string.alphanumeric({length: {min: 3, max: 30}}),
      description: faker.string.alphanumeric({length: {min: 40, max: 100}}),
      date: new Date(faker.date.future())
    }

    return new CreateTodoDto(data)
  }
}