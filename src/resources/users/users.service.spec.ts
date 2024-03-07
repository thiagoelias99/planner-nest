import { Test } from '@nestjs/testing'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from './entities/user.entity'
import { UsersRepository } from './users.repository'

const signupData: CreateUserDto = CreateUserDto.mock()

const responseData: User = User.mock()

describe('UsersService', () => {
  let usersService: UsersService
  let userRepository: UsersRepository

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn().mockResolvedValue('1'),
            findByEmail: jest.fn().mockResolvedValue(responseData),
            getProfile: jest.fn().mockResolvedValue(responseData),
            updateProfile: jest.fn().mockResolvedValue(responseData),
            deleteById: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile()

    usersService = moduleRef.get<UsersService>(UsersService)
    userRepository = moduleRef.get<UsersRepository>(UsersRepository)
  })

  it('should be defined', () => {
    expect(usersService).toBeDefined()
    expect(userRepository).toBeDefined()
  })

  describe('create', () => {
    it('should create a user', async () => {
      //Act
      const result = await usersService.create(signupData)
      //Assert
      expect(result).toEqual(responseData)
      expect(userRepository.create).toHaveBeenCalledWith(signupData)
      expect(userRepository.create).toHaveBeenCalledTimes(1)
      expect(userRepository.create).toHaveReturnedTimes(1)
      expect(userRepository.getProfile).toHaveBeenCalledWith('1')
      expect(userRepository.getProfile).toHaveReturnedTimes(1)
      expect(userRepository.getProfile).toHaveReturnedTimes(1)
    })

    it('should throw an error when repository fails', () => {
      //Arrange
      jest.spyOn(userRepository, 'create').mockRejectedValueOnce(new Error())
      // Act & Assert
      expect(
        usersService.create(signupData))
        .rejects
        .toThrow(Error)

      expect(userRepository.create).toHaveBeenCalledWith(signupData)
      expect(userRepository.create).toHaveBeenCalledTimes(1)
      expect(userRepository.create).toHaveReturnedTimes(1)
      expect(userRepository.getProfile).toHaveReturnedTimes(0)
    })
  })

  describe('findByEmail', () => {
    it('should return a user', async () => {
      //Act
      const result = await usersService.findByEmail(signupData.email)
      //Assert
      expect(result).toEqual(responseData)
      expect(userRepository.findByEmail).toHaveBeenCalledWith(signupData.email)
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1)
      expect(userRepository.findByEmail).toHaveReturnedTimes(1)
    })

    it('should throw an error when repository fails', () => {
      //Arrange
      jest.spyOn(userRepository, 'findByEmail').mockRejectedValueOnce(new Error())
      // Act & Assert
      expect(
        usersService.findByEmail(signupData.email))
        .rejects
        .toThrow(Error)

      expect(userRepository.findByEmail).toHaveBeenCalledWith(signupData.email)
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1)
      expect(userRepository.findByEmail).toHaveReturnedTimes(1)
    })
  })

  describe('getProfile', () => {
    it('should return a user', async () => {
      //Act
      const result = await usersService.getProfile('1')
      //Assert
      expect(result).toEqual(responseData)
      expect(userRepository.getProfile).toHaveBeenCalledWith('1')
      expect(userRepository.getProfile).toHaveBeenCalledTimes(1)
      expect(userRepository.getProfile).toHaveReturnedTimes(1)
    })

    it('should throw an error when repository fails', () => {
      //Arrange
      jest.spyOn(userRepository, 'getProfile').mockRejectedValueOnce(new Error())
      // Act & Assert
      expect(
        usersService.getProfile('1'))
        .rejects
        .toThrow(Error)

      expect(userRepository.getProfile).toHaveBeenCalledWith('1')
      expect(userRepository.getProfile).toHaveBeenCalledTimes(1)
      expect(userRepository.getProfile).toHaveReturnedTimes(1)
    })
  })

  describe('updateProfile', () => {
    it('should return a user', async () => {
      //Act
      const result = await usersService.updateProfile('1', signupData)
      //Assert
      expect(result).toEqual(responseData)
      expect(userRepository.updateProfile).toHaveBeenCalledWith('1', signupData)
      expect(userRepository.updateProfile).toHaveBeenCalledTimes(1)
      expect(userRepository.updateProfile).toHaveReturnedTimes(1)
      expect(userRepository.getProfile).toHaveBeenCalledWith('1')
      expect(userRepository.getProfile).toHaveBeenCalledTimes(1)
      expect(userRepository.getProfile).toHaveReturnedTimes(1)
    })

    it('should throw an error when repository fails', () => {
      //Arrange
      jest.spyOn(userRepository, 'updateProfile').mockRejectedValueOnce(new Error())
      // Act & Assert
      expect(
        usersService.updateProfile('1', signupData))
        .rejects
        .toThrow(Error)

      expect(userRepository.updateProfile).toHaveBeenCalledWith('1', signupData)
      expect(userRepository.updateProfile).toHaveBeenCalledTimes(1)
      expect(userRepository.updateProfile).toHaveReturnedTimes(1)
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      //Act
      const result = await usersService.delete('1')
      //Assert
      expect(result).toEqual(undefined)
      expect(userRepository.deleteById).toHaveBeenCalledWith('1')
      expect(userRepository.deleteById).toHaveBeenCalledTimes(1)
      expect(userRepository.deleteById).toHaveReturnedTimes(1)
    })

    it('should throw an error when repository fails', () => {
      //Arrange
      jest.spyOn(userRepository, 'deleteById').mockRejectedValueOnce(new Error())
      // Act & Assert
      expect(
        usersService.delete('1'))
        .rejects
        .toThrow(Error)

      expect(userRepository.deleteById).toHaveBeenCalledWith('1')
      expect(userRepository.deleteById).toHaveBeenCalledTimes(1)
      expect(userRepository.deleteById).toHaveReturnedTimes(1)
    })
  })
})