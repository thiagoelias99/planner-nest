import { Test, TestingModule } from '@nestjs/testing'
import { Controller, HttpCode, INestApplication, Post, UseGuards, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { useContainer } from 'class-validator'

import { AppModule } from '../app.module'
import { AuthGuard } from './auth.guard'
import { faker } from '@faker-js/faker'
import { JwtPayload } from '../resources/auth/auth.service'
import { JwtService } from '@nestjs/jwt'
import { CreateUserDto } from '../resources/users/dto/create-user.dto'
import { CreateTodoDto } from '../resources/todos/dto/create-todo.dto'
import { TodoOwnerGuard } from './todo-owner.guard'
import { TodosModule } from '../resources/todos/todos.module'

@Controller('tests/guards')
class TestsController {

  @Post('auth')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async testAuthGuard() {
    return { message: 'passed' }
  }

  @Post('todoowner')
  @HttpCode(200)
  // @UseGuards(AuthGuard)
  // @UseGuards(TodoOwnerGuard)
  @UseGuards(AuthGuard, TodoOwnerGuard)
  async test() {
    return { message: 'passed' }
  }
}

const tokenErrorMessage = 'Invalid JWT token'
const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('Guards Integration Tests', () => {
  let app: INestApplication
  let jwtService: JwtService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestsController],
      imports: [AppModule, TodosModule],
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

    jwtService = moduleFixture.get<JwtService>(JwtService)
  })

  describe('Auth Guard', () => {
    it('should return message if valid token is provided', async () => {
      // Arrange
      const payload: JwtPayload = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName()
      }

      const accessToken = await jwtService.sign(payload)
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/tests/guards/auth')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toEqual({ message: 'passed' })
    })

    it('should return error if no token is provided', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/tests/guards/auth')
        .expect(401)

      expect(response.body.message).toEqual(tokenErrorMessage)
    })

    it('should return error if invalid token is provided', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/tests/guards/auth')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401)

      expect(response.body.message).toEqual(tokenErrorMessage)
    })

    it('should return error if no Bearer token is provided', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/tests/guards/auth')
        .set('Authorization', `${invalidToken}`)
        .expect(401)

      expect(response.body.message).toEqual(tokenErrorMessage)
    })
  })

  describe('Todo Owner Guard', () => {
    const user1CreateData = CreateUserDto.mock()
    let user1AccessToken: string
    const user2CreateData = CreateUserDto.mock()
    let user2AccessToken: string
    let todoId: string


    beforeAll(async () => {
      // Arrange
      // Create a users
      await request(app.getHttpServer())
        .post('/signup')
        .send(user1CreateData)
        .expect(201)

      await request(app.getHttpServer())
        .post('/signup')
        .send(user2CreateData)
        .expect(201)

      // Get access token
      const user1AccessTokenResponse = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: user1CreateData.email,
          password: user1CreateData.password
        })
        .expect(200)
      user1AccessToken = user1AccessTokenResponse.body.accessToken

      const user2AccessTokenResponse = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: user2CreateData.email,
          password: user2CreateData.password
        })
        .expect(200)
      user2AccessToken = user2AccessTokenResponse.body.accessToken

      // Create a todo
      const todo = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(CreateTodoDto.getMock())
        .expect(201)

      todoId = todo.body.id
    })

    it('should return message if todo owner id is equal to user id', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/tests/guards/todoowner')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({ id: todoId })
        .expect(200)

      expect(response.body).toEqual({ message: 'passed' })
    })

    it('should return error if todo owner id is not equal to user id', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/tests/guards/todoowner')
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send({ id: todoId })
        .expect(403)
    })
  })
})