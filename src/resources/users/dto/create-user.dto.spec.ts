import { Test, TestingModule } from '@nestjs/testing'
import { Body, Controller, HttpCode, INestApplication, Post, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { useContainer } from 'class-validator'

import { AppModule } from '../../../app.module'
import { CreateUserDto } from './create-user.dto'

@Controller('tests/createusersdto')
class TestsController {

  @Post()
  @HttpCode(200)
  async testRoute(@Body() data: CreateUserDto) {
    return data
  }
}

const passwordFormatErrorMessage = 'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be between 8 and 30 characters long.'

describe('CreateUserDto Integration Tests', () => {
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

  afterEach(async () => {
    await app.close()
  })

  it('should reply if valid data is provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(200)
    // Assert
    expect(response.body).toEqual({...data, birthDate: new Date(data.birthDate).toISOString()})
  })

  it('should return error message if invalid email is provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    data.email = 'invalid email'
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toEqual(['email must be an email'])
  })

  it('should return error message if no email is provided', async () => {
    // Arrange
    const data = {
      password: 'Abc123@@##'
    }
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain('email must be an email')
  })

  it('should return error message if no password is provided', async () => {
    // Arrange
    const data = {
      email: 'test@email.com'
    }
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain('password must be a string')
  })

  it('should return error message if password is too short', async () => {
    // Arrange
    const data = {
      email: 'test',
      password: 'Abc1'
    }
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain(passwordFormatErrorMessage)
  })

  it('should return error message if password is too long', async () => {
    // Arrange
    const data = {
      email: 'test@email.com',
      password: 'Abc123@@##Abc123@@##Abc123@@##Abc123@@##'
    }
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain(passwordFormatErrorMessage)
  })

  it('should return error message if password has no lowercase letter', async () => {
    // Arrange
    const data = {
      email: 'test@email.com',
      password: 'ABC123@@##'
    }
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain(passwordFormatErrorMessage)
  })

  it('should return error message if password has no uppercase letter', async () => {
    // Arrange
    const data = {
      email: 'test@email.com',
      password: 'abc123@@##'
    }
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain(passwordFormatErrorMessage)
  })

  it('should return error message if password has no digit', async () => {
    // Arrange
    const data = {
      email: 'test@email.com',
      password: 'Abcdef@@##'
    }
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain(passwordFormatErrorMessage)
  })

  it('should return error message if password has no special character', async () => {
    // Arrange
    const data = {
      email: 'test@email.com',
      password: 'Abcdef1234'
    }
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain(passwordFormatErrorMessage)
  })

  it('should return error message if first name is not provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    delete data.firstName
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain('firstName must be a string')
  })

  it('should return error message if last name is not provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    delete data.lastName
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      .expect(400)
      // Assert
    expect(response.body.message).toContain('lastName must be a string')
  })

  it('should return error message if birth date is not provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    delete data.birthDate
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send(data)
      // Assert
      .expect(400)
    expect(response.body.message).toContain('birthDate must be a valid ISO 8601 date string')
  })

  it('should return error message if birth date is not a valid ISO date', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    delete data.birthDate
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send({...data, birthDate: '2000/01/01'})
      // Assert
      .expect(400)
    expect(response.body.message).toContain('birthDate must be a valid ISO 8601 date string')
  })

  it('should return error message if country is not provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    delete data.country
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send({...data, country: undefined})
      // Assert
      .expect(400)
    expect(response.body.message).toContain('country must be a string')
  })

  it('should return error message if city is not provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    delete data.city
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send({...data, city: undefined})
      // Assert
      .expect(400)
    expect(response.body.message).toContain('city must be a string')
  })

  it('should return error message if state is not provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    delete data.state
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send({...data, state: undefined})
      // Assert
      .expect(400)
    expect(response.body.message).toContain('state must be a string')
  })

  it('should return error message if language is not provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    delete data.language
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send({...data, language: undefined})
      // Assert
      .expect(400)
    expect(response.body.message).toContain('language must be one of the following values: en, es, pt-br')
  })

  it('should return error message if wrong language option is provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    delete data.language
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send({...data, language: 'wrong language'})
      // Assert
      .expect(400)
    expect(response.body.message).toContain('language must be one of the following values: en, es, pt-br')
  })

  it('should return error message if wrong theme option is provided', async () => {
    // Arrange
    const data = CreateUserDto.mock()
    delete data.theme
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createusersdto')
      .send({...data, theme: 'wrong theme'	})
      // Assert
      .expect(400)
    expect(response.body.message).toContain('theme must be one of the following values: default, dark')
  })
})

