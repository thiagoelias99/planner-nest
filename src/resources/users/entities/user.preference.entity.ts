import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { faker } from '@faker-js/faker'

export enum UserPreferenceLanguage {
  EN = 'en',
  ES = 'es',
  PT_BR = 'pt-br'
}

export enum UserPreferenceTheme {
  DEFAULT = 'default',
  DARK = 'dark'
}

export class UserPreference {
  @ApiProperty({ example: 'pt-br', enum: UserPreferenceLanguage}) language: UserPreferenceLanguage
  @ApiProperty({ example: 'default' }) theme: UserPreferenceTheme
  @Exclude() createdAt: Date
  @Exclude() updatedAt: Date
  @Exclude() id: string

  constructor(data: UserPreference) {
    Object.assign(this, data)
  }

  public static mock(): UserPreference {
    const data = {
      language: UserPreferenceLanguage.PT_BR,
      theme: UserPreferenceTheme.DARK,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: faker.string.uuid()
    }
    return data as UserPreference
  }
}