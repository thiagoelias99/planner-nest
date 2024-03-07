import { Exclude } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { faker } from '@faker-js/faker'

export class ToDo {
  @ApiProperty({ example: '21f58a70-3d62-4524-b564-3464d85e9e0d' }) id: string
  @ApiProperty({ example: 'Wash your face' }) title: string
  @ApiProperty({ example: 'Wash my face at every morning' }) description?: string
  @ApiProperty({ examples: [true, false] }) completed: boolean
  @ApiProperty({ example: new Date().toISOString() }) date: Date
  @Exclude() userId: string
  @ApiProperty({ example: new Date().toISOString() }) createdAt: Date
  @ApiProperty({ example: new Date().toISOString() }) updatedAt: Date

  constructor(data: ToDo) {
    Object.assign(this, data)
  }

  public static getMock(): ToDo {
    const data = {
      id: faker.string.uuid(),
      title: faker.string.alphanumeric({length: {min: 3, max: 25}}),
      description: faker.string.alphanumeric({length: {min: 40, max: 100}}),
      completed: faker.datatype.boolean(),
      date: new Date(faker.date.future()),
      userId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return new ToDo(data)
  }
}

export class ToDoList {
  @ApiProperty({ type: [ToDo] }) items: ToDo[]
  @ApiProperty({ example: 1 }) count: number

  constructor(data: ToDoList) {
    Object.assign(this, data)
  }
}