import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { useContainer } from 'class-validator'
import * as moment from 'moment'

import { AppModule } from '../../app.module'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { BudgetClassEnum, BudgetPaymentMethodEnum } from './budgets.entity'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { BudgetsService } from './budgets.service'
import { BudgetSummary } from './dto/summary.dto'

describe('BudgetsIntegration', () => {
  let app: INestApplication
  let accessToken: string
  let createdIds: string[]
  let budgetsService: BudgetsService

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

    budgetsService = moduleRef.get<BudgetsService>(BudgetsService)

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

    //Initial config
    createdIds = []
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /budgets', () => {
    afterAll(async () => {
      if (createdIds.length === 0) { return }
      else {
        await budgetsService.deleteBudgets(createdIds)
        createdIds = []
      }
    })

    it('should create a budget with only value', async () => {
      const createData: CreateBudgetDto = {
        value: 1000.99,
        budgetClass: BudgetClassEnum.INCOME
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

      createdIds.push(response.body.id)
    })

    it('should create a budget with all fields', async () => {
      const createData: CreateBudgetDto = {
        value: 1000.99,
        description: 'Test',
        consolidated: false,
        startDate: new Date('2021-01-01'),
        endDate: new Date(),
        paymentMethod: BudgetPaymentMethodEnum.PIX,
        budgetClass: BudgetClassEnum.INCOME,
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
      expect(response.body.budgetClass).toBe(createData.budgetClass)
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

      createdIds.push(response.body.id)
    })
  })

  describe('GET /budgets', () => {
    const budgetCreate1: CreateBudgetDto = {
      value: 1000,
      description: 'Budget 1 - Unique',
      budgetClass: BudgetClassEnum.INCOME
    }

    const budgetCreate2: CreateBudgetDto = {
      value: 2000,
      description: 'Budget 2 - Recurrent Start & End',
      startDate: moment().subtract(1, 'year').toDate(),
      endDate: moment().add(1, 'year').toDate(),
      budgetClass: BudgetClassEnum.INCOME
    }

    const budgetCreate3: CreateBudgetDto = {
      value: 3000,
      description: 'Budget 3 - Recurrent Start only',
      startDate: moment().subtract(6, 'month').toDate(),
      budgetClass: BudgetClassEnum.INCOME
    }

    const budgetCreate4: CreateBudgetDto = {
      value: 4000,
      description: 'Budget 4 - Recurrent Outdated',
      startDate: moment().subtract(6, 'month').toDate(),
      endDate: moment().subtract(4, 'month').toDate(),
      budgetClass: BudgetClassEnum.INCOME
    }

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(budgetCreate1)
        .then(response => createdIds.push(response.body.id))

      await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(budgetCreate2)
        .then(response => createdIds.push(response.body.id))

      await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(budgetCreate3)
        .then(response => createdIds.push(response.body.id))

      await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(budgetCreate4)
        .then(response => createdIds.push(response.body.id))
    })

    afterAll(async () => {
      if (createdIds.length === 0) { return }
      else {
        await budgetsService.deleteBudgets(createdIds)
        createdIds = []
      }
    })

    it('should return all budgets from user', () => {
      return request(app.getHttpServer())
        .get('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body).toHaveLength(4)
        })
    })

    it('should return budget from current month', () => {
      //Budget 1 - Unique
      //Budget 2 - Recurrent Start & End
      //Budget 3 - Recurrent Start only
      return request(app.getHttpServer())
        .get('/budgets')
        .query({ month: moment().month() })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body).toHaveLength(3)
          expect(response.body).toContainEqual(expect.objectContaining({ description: budgetCreate1.description }))
          expect(response.body).toContainEqual(expect.objectContaining({ description: budgetCreate2.description }))
          expect(response.body).toContainEqual(expect.objectContaining({ description: budgetCreate3.description }))
        })
    })

    it('should return budget from next month', () => {
      //Budget 2 - Recurrent Start & End
      //Budget 3 - Recurrent Start only
      return request(app.getHttpServer())
        .get('/budgets')
        .query({ month: moment().add(1, 'month').month(), year: moment().add(1, 'month').year() })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body).toHaveLength(2)
          expect(response.body).toContainEqual(expect.objectContaining({ description: budgetCreate2.description }))
          expect(response.body).toContainEqual(expect.objectContaining({ description: budgetCreate3.description }))
        })
    })

    it('should return budget from previous month', () => {
      //Budget 2 - Recurrent Start & End
      //Budget 3 - Recurrent Start only
      return request(app.getHttpServer())
        .get('/budgets')
        .query({ month: moment().subtract(1, 'month').month(), year: moment().subtract(1, 'month').year() })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body).toHaveLength(2)
          expect(response.body).toContainEqual(expect.objectContaining({ description: budgetCreate2.description }))
          expect(response.body).toContainEqual(expect.objectContaining({ description: budgetCreate3.description }))
        })
    })

    it('should return budget from this moth, 10 year in the future', () => {
      //Budget 3 - Recurrent Start only
      return request(app.getHttpServer())
        .get('/budgets')
        .query({ month: moment().month(), year: moment().add(10, 'year').year() })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body).toHaveLength(1)
          expect(response.body).toContainEqual(expect.objectContaining({ description: budgetCreate3.description }))
        })
    })

    it('should return budget from 2 years ago', () => {
      //None
      return request(app.getHttpServer())
        .get('/budgets')
        .query({ month: moment().month(), year: moment().subtract(2, 'year').year() })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body).toHaveLength(0)
        })
    })
  })

  describe('PATCH /budgets/:id/register/:subId', () => {
    const budgetCreate1: CreateBudgetDto = {
      value: 1000,
      description: 'Patch Budget 1',
      startDate: new Date('2024-05-09'),
      budgetClass: BudgetClassEnum.INCOME
      // endDate: new Date('2024-05-09'),
    }

    let originalBudgetSummary: BudgetSummary = null

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(budgetCreate1)
        .then(response => createdIds.push(response.body.id))

      await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => originalBudgetSummary = response.body)
    })

    afterAll(async () => {
      if (createdIds.length === 0) { return }
      else {
        await budgetsService.deleteBudgets(createdIds)
        createdIds = []
      }
    })

    it('should update register value', async () => {
      const registerId = originalBudgetSummary.incomes[0].id
      const newValue = 2000

      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: newValue })
        .expect(200)

      const updatedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(updatedBudgetSummary.incomes[0].value).toBe(newValue)
      expect(updatedBudgetSummary.incomes[0].date).toBe(originalBudgetSummary.incomes[0].date)
      expect(updatedBudgetSummary.incomes[0].isChecked).toBe(originalBudgetSummary.incomes[0].isChecked)

      //Revert changes
      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: originalBudgetSummary.incomes[0].value })
        .expect(200)

      const revertedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(revertedBudgetSummary.incomes[0].value).toBe(originalBudgetSummary.incomes[0].value)
    })

    it('should update register date', async () => {
      const registerId = originalBudgetSummary.incomes[0].id
      const newDate = new Date('2024-05-18')

      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ date: newDate.toISOString() })
        .expect(200)

      const updatedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(updatedBudgetSummary.incomes[0].value).toBe(originalBudgetSummary.incomes[0].value)
      expect(updatedBudgetSummary.incomes[0].date).toBe(newDate.toISOString())
      expect(updatedBudgetSummary.incomes[0].isChecked).toBe(originalBudgetSummary.incomes[0].isChecked)

      //Revert changes
      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ date: originalBudgetSummary.incomes[0].date })
        .expect(200)

      const revertedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(revertedBudgetSummary.incomes[0].date).toBe(originalBudgetSummary.incomes[0].date)
    })

    it('should update register isChecked', async () => {
      const registerId = originalBudgetSummary.incomes[0].id
      const newChecked = true

      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ checked: newChecked })
        .expect(200)

      const updatedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(updatedBudgetSummary.incomes[0].value).toBe(originalBudgetSummary.incomes[0].value)
      expect(updatedBudgetSummary.incomes[0].date).toBe(originalBudgetSummary.incomes[0].date)
      expect(updatedBudgetSummary.incomes[0].isChecked).toBe(newChecked)

      //Revert changes
      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ checked: originalBudgetSummary.incomes[0].isChecked })
        .expect(200)

      const revertedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(revertedBudgetSummary.incomes[0].isChecked).toBe(originalBudgetSummary.incomes[0].isChecked)
    })

    it('should update deleted field of register', async () => {
      const registerId = originalBudgetSummary.incomes[0].id

      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deleted: true })
        .expect(200)

      const updatedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(updatedBudgetSummary.incomes[0].value).toBe(originalBudgetSummary.incomes[0].value)
      expect(updatedBudgetSummary.incomes[0].date).toBe(originalBudgetSummary.incomes[0].date)
      expect(updatedBudgetSummary.incomes[0].isChecked).toBe(originalBudgetSummary.incomes[0].isChecked)
      expect(updatedBudgetSummary.incomes[0].deleted).toBe(true)

      //Revert changes
      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deleted: originalBudgetSummary.incomes[0].deleted })
        .expect(200)

      const revertedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(revertedBudgetSummary.incomes[0].deleted).toBe(originalBudgetSummary.incomes[0].deleted)
    })

    it('should update value of a checked register', async () => {
      const registerId = originalBudgetSummary.incomes[0].id
      const newValue = 999.99

      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ checked: true })
        .expect(200)

      const updatedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(updatedBudgetSummary.incomes[0].value).toBe(originalBudgetSummary.incomes[0].value)
      expect(updatedBudgetSummary.incomes[0].isChecked).toBeTruthy()

      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: newValue })
        .expect(200)

      const updatedBudgetSummary2 = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(updatedBudgetSummary2.incomes[0].value).toBe(newValue)
      expect(updatedBudgetSummary2.incomes[0].isChecked).toBeTruthy()

      //Revert changes
      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: originalBudgetSummary.incomes[0].value, checked: originalBudgetSummary.incomes[0].isChecked })
        .expect(200)

      const revertedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(revertedBudgetSummary.incomes[0].value).toBe(originalBudgetSummary.incomes[0].value)
      expect(revertedBudgetSummary.incomes[0].date).toBe(originalBudgetSummary.incomes[0].date)
      expect(revertedBudgetSummary.incomes[0].isChecked).toBe(originalBudgetSummary.incomes[0].isChecked)
    })

    it('should update all fields of register', async () => {
      const registerId = originalBudgetSummary.incomes[0].id
      const newValue = 2000
      const newDate = new Date('2024-05-18')
      const newChecked = true
      const newDeleted = true

      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: newValue, date: newDate.toISOString(), checked: newChecked, deleted: newDeleted })
        .expect(200)

      const updatedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(updatedBudgetSummary.incomes[0].value).toBe(newValue)
      expect(updatedBudgetSummary.incomes[0].date).toBe(newDate.toISOString())
      expect(updatedBudgetSummary.incomes[0].isChecked).toBe(newChecked)
      expect(updatedBudgetSummary.incomes[0].deleted).toBe(newDeleted)

      //Revert changes
      await request(app.getHttpServer())
        .patch(`/budgets/${originalBudgetSummary.incomes[0].parentId}/register/${registerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ value: originalBudgetSummary.incomes[0].value, date: originalBudgetSummary.incomes[0].date, checked: originalBudgetSummary.incomes[0].isChecked, deleted: originalBudgetSummary.incomes[0].deleted })
        .expect(200)

      const revertedBudgetSummary = await request(app.getHttpServer())
        .get('/budgets/summary/2024/4')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(response => response.body)

      expect(revertedBudgetSummary.incomes[0].value).toBe(originalBudgetSummary.incomes[0].value)
      expect(revertedBudgetSummary.incomes[0].date).toBe(originalBudgetSummary.incomes[0].date)
      expect(revertedBudgetSummary.incomes[0].isChecked).toBe(originalBudgetSummary.incomes[0].isChecked)
      expect(revertedBudgetSummary.incomes[0].deleted).toBe(originalBudgetSummary.incomes[0].deleted)
    })
  })
})