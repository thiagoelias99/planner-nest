import { Test, TestingModule } from '@nestjs/testing'
import { Body, Controller, HttpCode, INestApplication, Post, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { useContainer } from 'class-validator'

import { AppModule } from '../../../app.module'
import { CreateTodoDto } from './create-todo.dto'
import { TodosService } from '../todos.service'
import { ToDo } from '../todos.entity'

const createData = CreateTodoDto.getMock()
const responseData = ToDo.getMock()

@Controller('tests/createtodosdto')
class TestsController {

  @Post()
  @HttpCode(200)
  async testRoute(@Body() data: CreateTodoDto) {
    return data
  }
}

describe('CreateTodoDto Integration Tests', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestsController],
      imports: [AppModule],
      providers: [
        {
          provide: TodosService,
          useValue: {
            create: jest.fn().mockResolvedValue(responseData)
          }
        }
      ]
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
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createtodosdto')
      .send(createData)
      .expect(200)
    // Assert
    expect(response.body).toEqual({ ...createData, date: new Date(createData.date).toISOString() })
  })

  it('should return error message if no title is provided', async () => {
    // Arrange
    const data = createData
    delete data.title
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createtodosdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain('title must be a string')
  })

  it('should return error message if title is shorter than 3 characters', async () => {
    // Arrange
    const data = createData
    data.title = 'ab'
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createtodosdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain('title must be longer than or equal to 3 characters')
  })

  it('should return error message if title is longer than 30 characters', async () => {
    // Arrange
    const data = createData
    data.title = 'a'.repeat(31)
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createtodosdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain('title must be shorter than or equal to 30 characters')
  })

  it('should return error message if description is shorter than 3 characters', async () => {
    // Arrange
    const data = createData
    data.description = 'ab'
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createtodosdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain('description must be longer than or equal to 3 characters')
  })

  it('should return error message if description is longer than 255 characters', async () => {
    // Arrange
    const data = createData
    data.description = 'a'.repeat(256)
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createtodosdto')
      .send(data)
      .expect(400)
    // Assert
    expect(response.body.message).toContain('description must be shorter than or equal to 255 characters')
  })

  it('should return error message if date is not a valid date', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .post('/tests/createtodosdto')
      .send({...createData, date: '2000/01/01'})
      .expect(400)
    // Assert
    expect(response.body.message).toContain('date must be a valid ISO 8601 date string')
  })
})