import { Test, TestingModule } from '@nestjs/testing'
import { Body, Controller, HttpCode, INestApplication, Post, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { useContainer } from 'class-validator'
import { AppModule } from '../../../app.module'
import { UsersService } from '../users.service'
import { CreateUserDto } from '../dto/create-user.dto'

@Controller('tests/users')
class TestsController {

  @Post('uniqueemailvalidator')
  @HttpCode(200)
  async testRoute(@Body() data: CreateUserDto) {
    return { message: `validator pass for email ${data.email}` }
  }
}

describe('User Validator Tests', () => {
  let app: INestApplication
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

    usersService = moduleFixture.get<UsersService>(UsersService)
  })

  it('should pass if email are not duplicated', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/users/uniqueemailvalidator')
      .send(CreateUserDto.mock())
      .expect(200)

    // Assert
    expect(response.body).toHaveProperty('message')
  })

  it('should fail if email are duplicated', async () => {
    // Arrange
    const createUserData = CreateUserDto.mock()
    const createdUser = await usersService.create(createUserData)
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/users/uniqueemailvalidator')
      .send(createUserData)
      .expect(400)
    // Assert
    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toContain('email already exists.')
    // Clean Up
    await usersService.delete(createdUser.id)
  })
})