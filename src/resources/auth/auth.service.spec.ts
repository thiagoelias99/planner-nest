import { Test } from '@nestjs/testing'
import { describe } from 'node:test'
import { AuthService } from './auth.service'
import { UnauthorizedException } from '@nestjs/common'
import { AuthDto } from './auth.dto'
import { UsersService } from '../users/users.service'
import { JwtModule } from '@nestjs/jwt'
import { User } from '../users/entities/user.entity'
import { UserPreferenceLanguage, UserPreferenceTheme } from '../users/entities/user.preference.entity'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'

const userPassword = '123456Ab@'
const userEmail = 'test@email.com'
const salt = '\$2b\$10\$cCv4vrCjW01BEdcCJWouaO'

const userResponseData: User = {
  id: '1',
  email: userEmail,
  firstName: 'Thiago',
  lastName: 'Elias',
  birthDate: new Date('1989-05-09T17:57:34.000Z'),
  password: userPassword,
  createdAt: new Date('2021-05-09T17:57:34.000Z'),
  updatedAt: new Date('2021-05-09T17:57:34.000Z'),
  address: {
    id: '1',
    country: 'Brazil',
    city: 'São José dos Campos',
    state: 'São Paulo',
    createdAt: new Date('2021-05-09T17:57:34.000Z'),
    updatedAt: new Date('2021-05-09T17:57:34.000Z')
  },
  preferences: {
    id: '1',
    language: UserPreferenceLanguage.PT_BR,
    theme: UserPreferenceTheme.DARK,
    createdAt: new Date('2021-05-09T17:57:34.000Z'),
    updatedAt: new Date('2021-05-09T17:57:34.000Z')
  }
}

const loginData: AuthDto = {
  email: userEmail,
  password: userPassword,
}


describe('Auth Service', () => {
  let authService: AuthService
  let usersService: UsersService
  let hashedPassword: string

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(userResponseData),
          },
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true
        }),
        JwtModule.registerAsync({
          useFactory: (configService: ConfigService) => {
            return {
              secret: configService.get<string>('JWT_SECRET') || 'secret',
              signOptions: { expiresIn: '72h' },
            }
          },
          inject: [ConfigService],
          global: true,
        })
      ]
    }).compile()

    authService = moduleRef.get<AuthService>(AuthService)
    usersService = moduleRef.get<UsersService>(UsersService)
    hashedPassword = await bcrypt.hash(userPassword, salt)
    userResponseData.password = hashedPassword
  })

  it('should be defined', () => {
    expect(authService).toBeDefined()
    expect(usersService).toBeDefined()
  })

  describe('login', () => {
    it('should return an object containing a accessToken when successful', async () => {
      // Arrange
      //Act
      const result = await authService.login(loginData)
      //Assert
      expect(result).toHaveProperty('accessToken')
      expect(result.accessToken).toBeTruthy()
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginData.email)
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1)
      expect(usersService.findByEmail).toHaveReturnedTimes(1)
    })

    it('should throw an UnauthorizedException when email is wrong', async () => {
      // Arrange
      const email = 'wrongemail@email.com'
      // Act & Assert
      expect(
        authService.login({ ...loginData, email }))
        .rejects
        .toThrow(UnauthorizedException)

      expect(usersService.findByEmail).toHaveBeenCalledWith(email)
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1)
      expect(usersService.findByEmail).toHaveReturnedTimes(1)
    })

    it('should throw an UnauthorizedException when password is wrong', async () => {
      // Arrange
      const password = 'wrongPassword'
      // Act & Assert
      expect(
        authService.login({ ...loginData, password }))
        .rejects
        .toThrow(UnauthorizedException)

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginData.email)
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1)
      expect(usersService.findByEmail).toHaveReturnedTimes(1)
    })

    it('should throw an UnauthorizedException when user is not found', async () => {
      // Arrange
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(undefined)
      // Act & Assert
      expect(
        authService.login(loginData))
        .rejects
        .toThrow(UnauthorizedException)

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginData.email)
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1)
      expect(usersService.findByEmail).toHaveReturnedTimes(1)
    })

    it('should throw an error when repository fails', () => {
      jest.spyOn(usersService, 'findByEmail').mockRejectedValueOnce(new Error())

      // Act & Assert
      expect(
        authService.login(loginData))
        .rejects
        .toThrow(Error)

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginData.email)
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1)
      expect(usersService.findByEmail).toHaveReturnedTimes(1)
    })
  })
})