import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { useContainer } from 'class-validator'

import { BudgetsController } from './budgets.controller'
import { BudgetsService } from './budgets.service'
import { AppModule } from '../../app.module'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { Budget } from './budgets.entity'
import { CreateUserDto } from '../users/dto/create-user.dto'

const mockCreateBudgetDtoData: CreateBudgetDto = CreateBudgetDto.mock()
const mockBudgetResponseCreatedData: Budget = Budget.mock()

describe('BudgetsController', () => {
  let app: INestApplication
  let budgetController: BudgetsController
  let budgetsService: BudgetsService
  let accessToken: string

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [BudgetsController],
      providers: [
        {
          provide: BudgetsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockBudgetResponseCreatedData),
            find: jest.fn().mockResolvedValue([mockBudgetResponseCreatedData]),
          },
        },
      ],
      imports: [AppModule]
    }).compile()

    //Define the variables
    budgetController = moduleRef.get<BudgetsController>(BudgetsController)
    budgetsService = moduleRef.get<BudgetsService>(BudgetsService)

    //Initialize App
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    await app.init()

    //Register Test User
    const userLoginData = CreateUserDto.mock()
    await request(app.getHttpServer())
      .post('/signup')
      .send(userLoginData)

    //Login & Get JWT
    const response = await request(app.getHttpServer())
      .post('/login')
      .send({ password: userLoginData.password, email: userLoginData.email })
    accessToken = response.body.accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be defined', () => {
    expect(budgetController).toBeDefined()
    expect(budgetsService).toBeDefined()
  })

  describe('POST /budgets', () => {
    it('should deny access to unauthenticated users', async () => {
      // Arrange
      const data = { value: 100.99 }

      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .send(data)
        .expect(401)

      // Assert
      expect(response.body).toMatchObject({ statusCode: 401, message: 'Invalid JWT token' })
    })

    it('should create a new budget', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(mockCreateBudgetDtoData)
        .expect(201)

      // Assert
      expect(response.body).toHaveProperty('id')
    })

    it('should return error message if no value is provided', async () => {
      // Arrange
      const data = mockCreateBudgetDtoData
      delete data.value

      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(data)
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('value must be a positive number')
    })

    it('should return error message if value is not a number', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: 'abc' })
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })

    it('should return error message if value is not a positive number', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: -1 })
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })

    it('should return error if expectedDay is less than 1', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: 100, expectedDay: 0 })
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })

    it('should return error if expectedDay is greater than 31', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: 100, expectedDay: 32 })
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })

    it('should return error if startDate is not a valid date', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: 100, startDate: 'abc' })
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })

    it('should return error if endDate is not a valid date', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: 100, endDate: 'abc' })
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })

    it('should return error if endDate is provided without startDate', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: 100, endDate: '2021-01-01' })
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })

    it('should return error if endDate is before startDate', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: 100, startDate: '2021-01-01', endDate: '2020-01-01' })
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })

    it('should return error if paymentMethod is not a valid enum value', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: 100, paymentMethod: 'abc' })
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })
  })

  describe('GET /budgets', () => {
    it('should deny access to unauthenticated users', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/budgets')
        .expect(401)

      // Assert
      expect(response.body).toMatchObject({ statusCode: 401, message: 'Invalid JWT token' })
    })

    it('should return an array of budgets', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      // Assert
      expect(response.body).toBeInstanceOf(Array)
    })

    it('should return error if invalid month options is passed in query', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/budgets?month=12')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })

    it('should return error if invalid month options is passed in query', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/budgets?month=abc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })

    it('should return array if valid month (00) options is passed in query', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/budgets?month=0')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      // Assert
      expect(response.body).toBeInstanceOf(Array)
    })

    it('should return array if valid month (11) options is passed in query', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/budgets?month=11')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      // Assert
      expect(response.body).toBeInstanceOf(Array)
    })

    it('should return error if invalid options is passed in query', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/budgets?invalid=11')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
    })
  })
})