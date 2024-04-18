import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { useContainer } from 'class-validator'

import { AppModule } from '../../app.module'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { BudgetPaymentMethodEnum } from './budgets.entity'
import { CreateUserDto } from '../users/dto/create-user.dto'

describe('BudgetsIntegration', () => {
  let app: INestApplication
  let accessToken: string

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

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

  describe('POST /budgets', () => {
    it('should create a budget with only value', async () => {
      const createData: CreateBudgetDto = {
        value: 1000.99,
      }

      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('currentValue')
      expect(response.body.currentValue).toBe(createData.value)
      expect(response.body.isRecurrent).toBeFalsy()
      expect(response.body).toHaveProperty('recurrenceHistory')
      expect(response.body.recurrenceHistory).toHaveProperty('registers')
      expect(response.body.recurrenceHistory.registers).toBeInstanceOf(Array)
      expect(response.body.recurrenceHistory.registers).toHaveLength(1)
      expect(response.body.recurrenceHistory.registers[0]).toHaveProperty('value')
      expect(response.body.recurrenceHistory.registers[0].value).toBe(createData.value)
      expect(response.body.description).toBe('Extra')
    })

    it('should create a budget with all fields', async () => {
      const createData: CreateBudgetDto = {
        value: 1000.99,
        description: 'Test',
        consolidated: false,
        startDate: new Date('2021-01-01'),
        endDate: new Date(),
        paymentMethod: BudgetPaymentMethodEnum.PIX,
        isIncome: false,
      }

      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.currentValue).toBe(createData.value)
      expect(response.body.description).toBe(createData.description)
      expect(response.body.isRecurrent).toBeTruthy()
      expect(response.body.isIncome).toBe(createData.isIncome)
      expect(response.body.paymentMethod).toBe(createData.paymentMethod)

      expect(response.body).toHaveProperty('recurrenceHistory')
      expect(response.body.recurrenceHistory).toHaveProperty('registers')
      expect(response.body.recurrenceHistory.registers).toBeInstanceOf(Array)
      expect(response.body.recurrenceHistory.registers).toHaveLength(1)
      expect(response.body.recurrenceHistory.registers[0]).toHaveProperty('value')
      expect(response.body.recurrenceHistory.registers[0].value).toBe(createData.value)

      expect(response.body.recurrenceHistory).toHaveProperty('activePeriods')
      expect(response.body.recurrenceHistory.activePeriods).toBeInstanceOf(Array)
      expect(response.body.recurrenceHistory.activePeriods).toHaveLength(1)
      expect(response.body.recurrenceHistory.activePeriods[0]).toHaveProperty('startDate')
      expect(response.body.recurrenceHistory.activePeriods[0].startDate).toBe(createData.startDate.toISOString())
      expect(response.body.recurrenceHistory.activePeriods[0]).toHaveProperty('endDate')
      expect(response.body.recurrenceHistory.activePeriods[0].endDate).toBe(createData.endDate.toISOString())



    })
  })
})