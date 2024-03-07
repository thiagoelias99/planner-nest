import { Test, TestingModule } from '@nestjs/testing'
import { Body, Controller, HttpCode, INestApplication, Post, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { useContainer } from 'class-validator'

import { HashPasswordPipe } from './hash-password.pipe'
import { AppModule } from '../app.module'
import { User } from '../resources/users/entities/user.entity'

@Controller('tests/pipes')
class TestsController {

  @Post()
  @HttpCode(200)
  async testRoute(@Body('password', HashPasswordPipe) hashedPassword: string) {
    return { hashedPassword }
  }
}

describe('Pipes Integration Tests', () => {
  let app: INestApplication

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
  })

  describe('Hash Password Pipe', () => {
    it('should get the password from request body and return as hashedPassword', async () => {
      //Act && Assert
      const response = await request(app.getHttpServer())
        .post('/tests/pipes')
        .send({ password: User.userPasswordMock() })
        .expect(200)

      expect(response.body).toHaveProperty('hashedPassword')
      expect(response.body.hashedPassword).not.toEqual(User.userPasswordMock())
    })
  })
})