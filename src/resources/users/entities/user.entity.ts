import { Exclude } from 'class-transformer'
import { UserAddress } from './user-address.entity'
import { UserPreference } from './user.preference.entity'
import { ApiProperty } from '@nestjs/swagger'
import { faker } from '@faker-js/faker'

export class User {
  @ApiProperty({ example: '21f58a70-3d62-4524-b564-3464d85e9e0d' }) id: string
  @ApiProperty({ example: 'Thiago' }) firstName: string
  @ApiProperty({ example: 'Elias' }) lastName: string
  @ApiProperty({ example: 'thiago@email.com' }) email: string
  @Exclude() password: string //Needs to use ClassSerializerInterceptor in app.module.ts
  @ApiProperty({ example: new Date().toISOString() }) birthDate: Date
  @ApiProperty({ example: new Date().toISOString() }) createdAt: Date
  @ApiProperty({ example: new Date().toISOString() }) updatedAt: Date

  @ApiProperty() address: UserAddress
  @ApiProperty() preferences: UserPreference

  constructor(data: User) {
    Object.assign(this, data)
  }

  public static mock(): User {
    const data = {
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: this.userPasswordMock(),
      birthDate: new Date(faker.date.birthdate({ min: 18, max: 65, mode: 'age' })),
      createdAt: new Date(),
      updatedAt: new Date(),
      address: UserAddress.mock(),
      preferences: UserPreference.mock()
    }
    return new User(data)
  }

  public static userPasswordMock(): string {
    return '123456Abc@@##'
  }
}