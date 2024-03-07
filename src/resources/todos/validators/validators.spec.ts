import { Test, TestingModule } from '@nestjs/testing'
import { Body, Controller, HttpCode, INestApplication, Post, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { useContainer } from 'class-validator'
import { AppModule } from '../../../app.module'
import { DeleteTodoDto } from '../dto/delete-todo.dto'
import { TodosService } from '../todos.service'
import { CreateTodoDto } from '../dto/create-todo.dto'
import { UsersService } from '../../users/users.service'
import { CreateUserDto } from '../../users/dto/create-user.dto'
import { randomUUID } from 'crypto'

@Controller('tests/todos')
class TestsController {

  @Post('todoexistsvalidator')
  @HttpCode(200)
  async testRoute(@Body() data: DeleteTodoDto) {
    return { message: `validator pass for todo ${data.id}` }
  }
}

describe('User Validator Tests', () => {
  let app: INestApplication
  let todosService: TodosService
  let usersService: UsersService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestsController],
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    await app.init()

    todosService = moduleFixture.get<TodosService>(TodosService)
    usersService = moduleFixture.get<UsersService>(UsersService)
  })

  it('should pass if todo id exists', async () => {
    // Arrange
    const createdUserId = await usersService.create(CreateUserDto.mock())
    const createTodoData = CreateTodoDto.getMock()
    const createdTodo = await todosService.create(createdUserId.id, createTodoData)
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/todos/todoexistsvalidator')
      .send({ id: createdTodo.id })
      .expect(200)
    // Assert
    expect(response.body).toHaveProperty('message')
    // Clean Up
    await todosService.deleteById(createdTodo.id)
  })

  it('should fail if todo id not exists', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/todos/todoexistsvalidator')
      .send({ id: randomUUID() })
      .expect(400)
    // Assert
    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toContain('id not exists.')
  })
})