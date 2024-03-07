import { Test } from '@nestjs/testing'
import { describe } from 'node:test'
import { AuthController } from './auth.controller'
import { AuthResponse, AuthService } from './auth.service'
import { UnauthorizedException } from '@nestjs/common'
import { AuthDto } from './auth.dto'

const loginData: AuthDto = {
  email: 'test@email.com',
  password: '123456Ab@',
}

const mockAuthResponse: AuthResponse = {
  accessToken: 'mockedToken',
}


describe('AuthController', () => {
  let authController: AuthController
  let authService: AuthService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(mockAuthResponse),
          },
        },
      ],
    }).compile()

    authController = moduleRef.get<AuthController>(AuthController)
    authService = moduleRef.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(authController).toBeDefined()
    expect(authController).toBeDefined()
  })

  describe('login', () => {
    it('should return an object containing a accessToken when successful', async () => {
      // Arrange
      jest.spyOn(authService, 'login')

      // Act
      const result = await authController.login(loginData)

      // Assert
      expect(result).toEqual(mockAuthResponse)
      expect(authService.login).toHaveBeenCalledWith(loginData)
      expect(authService.login).toHaveBeenCalledTimes(1)
      expect(authService.login).toHaveReturnedTimes(1)
    })

    it('should throw an UnauthorizedException when login fails', async () => {
      // Arrange
      jest.spyOn(authService, 'login').mockRejectedValueOnce(new UnauthorizedException())

      // Act & Assert
      expect(
        authController.login(loginData))
        .rejects
        .toThrow(UnauthorizedException)

      expect(authService.login).toHaveBeenCalledWith(loginData)
      expect(authService.login).toHaveBeenCalledTimes(1)
      expect(authService.login).toHaveReturnedTimes(1)
    })
  })
})