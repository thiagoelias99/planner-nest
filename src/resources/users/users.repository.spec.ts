import { Test } from '@nestjs/testing'
import { PrismaUserRepository } from '../../prisma/repositories/User/prisma-users.repository'
import { PrismaService } from '../../prisma/prisma-service.ts'
import { UsersRepository } from './users.repository'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

describe('Users Repository', () => {
  let userRepository: UsersRepository

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: UsersRepository,
          useClass: PrismaUserRepository
        }
      ],
    }).compile()

    userRepository = moduleRef.get<UsersRepository>(UsersRepository)
  })

  it('should be defined', () => {
    expect(userRepository).toBeDefined()
  })

  describe('create', () => {
    it('should create a user in database and return a uuid', async () => {
      //Act
      const userId = await userRepository.create({ ...CreateUserDto.mock(), email: 'create1@test.com' })
      //Assert
      expect(userId).toBeTruthy()
      expect(userId).toHaveLength(36)
      //Restore
      await expect(userRepository.deleteById(userId)).resolves.not.toThrow(Error)
    })
    it('should throw an error if email already exists', async () => {
      //Arrange
      const user = { ...CreateUserDto.mock(), email: 'create2@test.com' }
      const userId = await userRepository.create(user)
      //Act Assert
      await expect(
        userRepository.create(user))
        .rejects
        .toThrow(Error)
      //Restore
      await expect(userRepository.deleteById(userId)).resolves.not.toThrow(Error)
    })
  })

  describe('findByEmail', () => {
    it('should return a user if email exists', async () => {
      //Arrange
      const user = { ...CreateUserDto.mock(), email: 'findemail1@email.com' }
      const userId = await userRepository.create(user)
      //Act
      const userFound = await userRepository.findByEmail(user.email)
      //Assert
      expect(userFound).toBeTruthy()
      expect(userFound.id).toBe(userId)
      expect(userFound.email).toBe(user.email)
      expect(userFound.address.id).toBeTruthy()
      expect(userFound.preferences.id).toBeTruthy()
      //Restore
      await expect(userRepository.deleteById(userId)).resolves.not.toThrow(Error)
    })

    it('should return null if email does not exist', async () => {
      //Arrange
      const email = 'noexistingemail@email.com'
      //Act
      const userFound = await userRepository.findByEmail(email)
      //Assert
      expect(userFound).toBeNull()
    })
  })

  describe('getProfile', () => {
    it('should return a user if uuid exists', async () => {
      //Arrange
      const user = { ...CreateUserDto.mock(), email: 'profile1@test.com' }
      const userId = await userRepository.create(user)
      //Act
      const userFound = await userRepository.getProfile(userId)
      //Assert
      expect(userFound).toBeTruthy()
      expect(userFound.id).toBe(userId)
      expect(userFound.email).toBe(user.email)
      expect(userFound.address.id).toBeTruthy()
      expect(userFound.preferences.id).toBeTruthy()
      //Restore
      await expect(userRepository.deleteById(userId)).resolves.not.toThrow(Error)
    })

    it('should return null if uuid does not exist', async () => {
      //Arrange
      const uuid = 'noExistingUuid'
      //Act
      const userFound = await userRepository.getProfile(uuid)
      //Assert
      expect(userFound).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should update a user if uuid exists', async () => {
      //Arrange
      const user = { ...CreateUserDto.mock(), email: 'update1@email.com' }
      const userId = await userRepository.create(user)
      const updateDate = new Date()
      const updateData: UpdateUserDto = {
        firstName: 'updatedFirstName',
        lastName: 'updatedLastName',
        city: 'updatedCity',
        state: 'updatedState',
        country: 'updatedCountry',
        language: 'updatedLanguage',
        theme: 'updatedTheme',
        birthDate: updateDate
      }
      //Act
      const updatedUserId = await userRepository.updateProfile(userId, updateData)
      const updatedUserFromDb = await userRepository.getProfile(updatedUserId)
      //Assert
      expect(updatedUserId).toBe(userId)
      expect(updatedUserFromDb).toBeTruthy()
      expect(updatedUserFromDb.id).toBe(userId)
      expect(updatedUserFromDb.firstName).toBe(updateData.firstName)
      expect(updatedUserFromDb.lastName).toBe(updateData.lastName)
      expect(updatedUserFromDb.address.city).toBe(updateData.city)
      expect(updatedUserFromDb.address.state).toBe(updateData.state)
      expect(updatedUserFromDb.address.country).toBe(updateData.country)
      expect(updatedUserFromDb.preferences.language).toBe(updateData.language)
      expect(updatedUserFromDb.preferences.theme).toBe(updateData.theme)
      expect(updatedUserFromDb.birthDate).toEqual(updateDate)

      //Restore
      await expect(userRepository.deleteById(userId)).resolves.not.toThrow(Error)
    })
  })

  describe('deleteById', () => {
    it('should delete a user if uuid exists', async () => {
      //Arrange
      const user = { ...CreateUserDto.mock(), email: 'delete1@test.com' }
      const userId = await userRepository.create(user)
      //Act
      await userRepository.deleteById(userId)
      //Assert
      await expect(userRepository.getProfile(userId)).resolves.toBeNull()
    })

    it('should throw an error if uuid does not exist', async () => {
      //Arrange
      const uuid = 'noExistingUuid'
      //Act Assert
      await expect(userRepository.deleteById(uuid)).rejects.toThrow(Error)
    })
  })
})