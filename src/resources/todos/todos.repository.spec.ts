import { Test } from '@nestjs/testing'
import { TodosRepository } from './todos.repository'
import { PrismaService } from '../../prisma/prisma-service.ts'
import { PrismaTodosRepository } from '../../prisma/repositories/Todo/prisma-todos.repository'
import { UsersRepository } from '../users/users.repository'
import { PrismaUserRepository } from '../../prisma/repositories/User/prisma-users.repository'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { CreateTodoDto } from './dto/create-todo.dto'

describe('Todos Repository', () => {
  let todosRepository: TodosRepository
  let userRepository: UsersRepository
  let userId1: string
  let userId2: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: TodosRepository,
          useClass: PrismaTodosRepository
        },
        {
          provide: UsersRepository,
          useClass: PrismaUserRepository
        }
      ],
    }).compile()

    todosRepository = moduleRef.get<TodosRepository>(TodosRepository)
    userRepository = moduleRef.get<UsersRepository>(UsersRepository)

    //Create a user to associate with the todo
    userId1 = await userRepository.create({ ...CreateUserDto.mock(), email: 'createTodo1@test.com' })
    userId2 = await userRepository.create({ ...CreateUserDto.mock(), email: 'createTodo2@test.com' })
  })

  afterAll(async () => {
    //Delete the user associated with the todo
    await userRepository.deleteById(userId1)
    await userRepository.deleteById(userId2)
  })

  it('should be defined', () => {
    expect(todosRepository).toBeDefined()
    expect(userRepository).toBeDefined()
  })

  describe('create', () => {
    it('should create a todo in database and return a uuid', async () => {
      //Act
      const todoId = await todosRepository.create(userId1, CreateTodoDto.getMock())
      //Assert
      expect(todoId).toBeTruthy()
      expect(todoId).toHaveLength(36)
      //Restore
      await expect(todosRepository.deleteById(todoId)).resolves.not.toThrow(Error)
    })
  })

  describe('deleteById', () => {
    it('should delete a todo in database', async () => {
      //Arrange
      const todoId = await todosRepository.create(userId1, CreateTodoDto.getMock())
      //Act
      await expect(todosRepository.deleteById(todoId)).resolves.not.toThrow(Error)
      //Assert
      await expect(todosRepository.deleteById(todoId)).rejects.toThrow(Error)
    })

    it('should throw an error if todo does not exist', async () => {
      //Arrange
      const todoId = 'noExistingUuid'
      //Act Assert
      await expect(todosRepository.deleteById(todoId)).rejects.toThrow(Error)
    })
  })

  describe('findById', () => {
    it('should return a todo if id exists', async () => {
      //Arrange
      const mockTodo = CreateTodoDto.getMock()
      const todoId = await todosRepository.create(userId1, mockTodo)
      //Act
      const todoFound = await todosRepository.findById(todoId)
      //Assert
      expect(todoFound).toBeTruthy()
      expect(todoFound.id).toBe(todoId)
      expect(todoFound.title).toBe(mockTodo.title)
      expect(todoFound.description).toBe(mockTodo.description)
      expect(todoFound.completed).toBe(false)
      expect(todoFound.date).toEqual(mockTodo.date)
      //Restore
      await expect(todosRepository.deleteById(todoId)).resolves.not.toThrow(Error)
    })

    it('should return null if id does not exist', async () => {
      //Arrange
      const todoId = 'noExistingUuid'
      //Act
      const todoFound = await todosRepository.findById(todoId)
      //Assert
      expect(todoFound).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return a list of todos if userId exists', async () => {
      //Arrange
      const mockTodo1 = CreateTodoDto.getMock()
      const mockTodo2 = CreateTodoDto.getMock()
      const mockTodo3 = CreateTodoDto.getMock()
      const mockTodo4 = CreateTodoDto.getMock()
      const mockTodo5 = CreateTodoDto.getMock()
      const todoId1 = await todosRepository.create(userId1, mockTodo1)
      const todoId2 = await todosRepository.create(userId1, mockTodo2)
      const todoId3 = await todosRepository.create(userId1, mockTodo3)
      const todoId4 = await todosRepository.create(userId2, mockTodo4)
      const todoId5 = await todosRepository.create(userId2, mockTodo5)
      //Act
      const todosFound1 = await todosRepository.findAll(userId1)
      const todosFound2 = await todosRepository.findAll(userId2)
      //Assert
      expect(todosFound1.items).toBeTruthy()
      expect(todosFound2.items).toBeTruthy()
      expect(todosFound1.items).toHaveLength(3)
      expect(todosFound2.items).toHaveLength(2)
      expect(todosFound1.count).toEqual(3)
      expect(todosFound2.count).toEqual(2)
      expect(todosFound1.items).toContainEqual(expect.objectContaining({ id: todoId1 }))
      expect(todosFound1.items).toContainEqual(expect.objectContaining({ id: todoId2 }))
      expect(todosFound1.items).toContainEqual(expect.objectContaining({ id: todoId3 }))
      expect(todosFound2.items).toContainEqual(expect.objectContaining({ id: todoId4 }))
      expect(todosFound2.items).toContainEqual(expect.objectContaining({ id: todoId5 }))
      //Restore
      await expect(todosRepository.deleteById(todoId1)).resolves.not.toThrow(Error)
      await expect(todosRepository.deleteById(todoId2)).resolves.not.toThrow(Error)
      await expect(todosRepository.deleteById(todoId3)).resolves.not.toThrow(Error)
      await expect(todosRepository.deleteById(todoId4)).resolves.not.toThrow(Error)
      await expect(todosRepository.deleteById(todoId5)).resolves.not.toThrow(Error)
    })

    it('should return an empty list if userId does not exist', async () => {
      //Arrange
      const userId = 'noExistingUuid'
      //Act
      const todosFound = await todosRepository.findAll(userId)
      //Assert
      expect(todosFound).toBeTruthy()
      expect(todosFound.items).toHaveLength(0)
      expect(todosFound.count).toEqual(0)
    })
  })

  describe('update', () => {
    it('should update a todo if id exists', async () => {
      //Arrange
      const mockTodo = CreateTodoDto.getMock()
      const todoId = await todosRepository.create(userId1, mockTodo)
      const mockTodoUpdated = CreateTodoDto.getMock()
      //Act
      const todoUpdated = await todosRepository.update({ ...mockTodoUpdated, id: todoId, completed: true })
      //Assert
      expect(todoUpdated).toBeTruthy()
      expect(todoUpdated.id).toBe(todoId)
      expect(todoUpdated.title).toBe(mockTodoUpdated.title)
      expect(todoUpdated.description).toBe(mockTodoUpdated.description)
      expect(todoUpdated.completed).toBe(true)
      expect(todoUpdated.date).toEqual(mockTodoUpdated.date)
      //Restore
      await expect(todosRepository.deleteById(todoId)).resolves.not.toThrow(Error)
    })

    it('should throw an error if id does not exist', async () => {
      //Arrange
      const mockTodoUpdated = CreateTodoDto.getMock()
      //Act Assert
      await expect(todosRepository.update({ ...mockTodoUpdated, id: 'noExistingUuid' })).rejects.toThrow(Error)
    })
  })
})