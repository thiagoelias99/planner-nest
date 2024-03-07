import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { faker } from '@faker-js/faker'

export class UserAddress {
  @ApiProperty({ example: 'Brazil' }) country: string
  @ApiProperty({ example: 'São José dos Campos' }) city: string
  @ApiProperty({ example: 'São Paulo' }) state: string
  @Exclude() createdAt: Date
  @Exclude() updatedAt: Date
  @Exclude() id: string

  constructor(data: UserAddress) {
    Object.assign(this, data)
  }

  public static mock(): UserAddress {
    const data = {
      country: faker.location.country(),
      city: faker.location.city(),
      state: faker.location.state(),
      createdAt: new Date(),
      updatedAt: new Date(),
      id: faker.string.uuid()
    }
    return data as UserAddress
  }
}