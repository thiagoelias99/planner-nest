import { Test, TestingModule } from '@nestjs/testing'
import { Body, Controller, HttpCode, INestApplication, Post, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { useContainer } from 'class-validator'

import { AppModule } from '../../app.module'
import { AuthDto } from './auth.dto'

@Controller('tests/authdto')
class TestsController {

  @Post()
  @HttpCode(200)
  async testRoute(@Body() data: AuthDto) {
    return data
  }
}

describe('AuthDto Integration Tests', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestsController],
      imports: [AppModule]
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

  it('should reply if valid data is provided', async () => {
    // Arrange
    const data = {
      email: 'test@email.com',
      password: 'Abc123@@##'
    }
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/authdto')
      .send(data)
      .expect(200)
    // Assert
    expect(response.body).toEqual(data)
  })
})