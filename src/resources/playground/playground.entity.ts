import { ApiProperty } from '@nestjs/swagger'

export class Cat {
  @ApiProperty({ example: '21f58a70-3d62-4524-b564-3464d85e9e0d' }) id: string
  @ApiProperty({ example: 'Fuffy' }) name: string
  @ApiProperty({ example: 3 }) age: number
}