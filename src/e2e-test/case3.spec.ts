/**
 * Test case 3
 * - Register a user
 * - Login and receive JWT
 * - Create a recurrently income budget
 * - Create a recurrently expense budget
 * - Create a one-time income budget
 * - Create a one-time expense budget
 * - Get budgets summary from current month
 * - Check a budget (recurrently income budget)
 * - Check a budget (one-time expense budget)
 * - Get budgets summary from current month
 * - Uncheck a budget (one-time expense budget)
 * - Get budgets summary from current month
 * - Delete a budget (one-time expense budget)
 * - Get budgets summary from current month
 * - Get budgets summary from next month
 */

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { useContainer } from 'class-validator'
import * as moment from 'moment'

import { AppModule } from '../app.module'
import { CreateUserDto } from '../resources/users/dto/create-user.dto'
import { BudgetClassEnum, BudgetPaymentMethodEnum, BudgetSimplified } from '../resources/budgets/budgets.entity'

const userLoginData = CreateUserDto.mock()
let accessToken: string

const budgetsData = [
  {
    value: 2000,
    description: 'recurrently income',
    startDate: moment().subtract(6, 'month').toDate(),
    consolidated: false,
    budgetClass: BudgetClassEnum.INCOME
  },
  {
    value: 1000,
    description: 'recurrently expense',
    startDate: moment().subtract(6, 'month').toDate(),
    consolidated: false,
    budgetClass: BudgetClassEnum.EXPENSE
  },
  {
    value: 500,
    description: 'one-time income',
    consolidated: false,
    budgetClass: BudgetClassEnum.INCOME
  },
  {
    value: 250,
    description: 'one-time expense',
    consolidated: false,
    budgetClass: BudgetClassEnum.EXPENSE
  },
  //Credit must be ignored in summary
  {
    value: 222,
    description: 'credit income',
    paymentMethod: BudgetPaymentMethodEnum.CREDIT,
    budgetClass: BudgetClassEnum.INCOME
  },
  {
    value: 111,
    description: 'credit expense',
    budgetClass: BudgetClassEnum.EXPENSE,
    paymentMethod: BudgetPaymentMethodEnum.CREDIT},
]

let recurrentlyIncome: BudgetSimplified = null
// let recurrentlyExpense: BudgetSimplified = null
// let oneTimeIncome: BudgetSimplified = null
let oneTimeExpense: BudgetSimplified = null

describe('Case 3 - E2E', () => {
  let app: INestApplication


  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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

  it('should register a user', async () => {
    // Arrange
    // Act
    const response = await request(app.getHttpServer())
      .post('/signup')
      .send(userLoginData)
      .expect(201)
    // Assert
    expect(response.body).toHaveProperty('id')
  })

  it('should login and receive JWT', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .post('/login')
      .send({ password: userLoginData.password, email: userLoginData.email })
      .expect(200)
    // Assert
    expect(response.body).toHaveProperty('accessToken')
    accessToken = response.body.accessToken
  })

  it('should create 4 Budgets', async () => {
    // Act
    const budgetsMap = budgetsData.map(budget => {
      return request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(budget)
        .expect(201)
    })

    await Promise.all(budgetsMap)
  })

  it('should get budgets summary from current month ', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get(`/budgets/summary/${moment().year()}/${moment().month()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    // Assert
    expect(response.body.incomes).toHaveLength(3)
    expect(response.body.outcomes).toHaveLength(3)
    expect(response.body.predictedIncomeValue).toBe(2500)
    expect(response.body.predictedOutcomeValue).toBe(1250)
    expect(response.body.predictedBalance).toBe(1250)
    expect(response.body.actualIncomeValue).toBe(0)
    expect(response.body.actualOutcomeValue).toBe(0)
    expect(response.body.actualBalance).toBe(0)

    recurrentlyIncome = response.body.incomes.find(b => b.description === 'recurrently income')
    // recurrentlyExpense = response.body.outcomes.find(b => b.description === 'recurrently expense')
    // oneTimeIncome = response.body.incomes.find(b => b.description === 'one-time income')
    oneTimeExpense = response.body.outcomes.find(b => b.description === 'one-time expense')
  })

  it('should check a budget (recurrently income budget)', async () => {
    // Act
    await request(app.getHttpServer())
      .patch(`/budgets/${recurrentlyIncome.parentId}/register/${recurrentlyIncome.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ checked: true })
      .expect(200)
  })

  it('should check a budget (one-time expense budget)', async () => {
    // Act
    await request(app.getHttpServer())
      .patch(`/budgets/${oneTimeExpense.parentId}/register/${oneTimeExpense.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ checked: true })
      .expect(200)
  })

  it('should get budgets summary from current month', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get(`/budgets/summary/${moment().year()}/${moment().month()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    // Assert
    expect(response.body.incomes).toHaveLength(3)
    expect(response.body.outcomes).toHaveLength(3)
    expect(response.body.predictedIncomeValue).toBe(2500)
    expect(response.body.predictedOutcomeValue).toBe(1250)
    expect(response.body.predictedBalance).toBe(1250)
    expect(response.body.actualIncomeValue).toBe(2000)
    expect(response.body.actualOutcomeValue).toBe(250)
    expect(response.body.actualBalance).toBe(1750)
  })

  it('should uncheck a budget (one-time expense budget)', async () => {
    // Act
    await request(app.getHttpServer())
      .patch(`/budgets/${oneTimeExpense.parentId}/register/${oneTimeExpense.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ checked: false })
      .expect(200)
  })

  it('should get budgets summary from current month', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get(`/budgets/summary/${moment().year()}/${moment().month()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    // Assert
    expect(response.body.incomes).toHaveLength(3)
    expect(response.body.outcomes).toHaveLength(3)
    expect(response.body.predictedIncomeValue).toBe(2500)
    expect(response.body.predictedOutcomeValue).toBe(1250)
    expect(response.body.predictedBalance).toBe(1250)
    expect(response.body.actualIncomeValue).toBe(2000)
    expect(response.body.actualOutcomeValue).toBe(0)
    expect(response.body.actualBalance).toBe(2000)
  })

  it('should delete a budget (one-time expense budget)', async () => {
    // Act
    await request(app.getHttpServer())
      .patch(`/budgets/${oneTimeExpense.parentId}/register/${oneTimeExpense.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ deleted: true })
      .expect(200)
  })

  it('should get budgets summary from current month', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get(`/budgets/summary/${moment().year()}/${moment().month()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    // Assert
    expect(response.body.incomes).toHaveLength(3)
    expect(response.body.outcomes).toHaveLength(3)
    expect(response.body.predictedIncomeValue).toBe(2500)
    expect(response.body.predictedOutcomeValue).toBe(1000)
    expect(response.body.predictedBalance).toBe(1500)
    expect(response.body.actualIncomeValue).toBe(2000)
    expect(response.body.actualOutcomeValue).toBe(0)
    expect(response.body.actualBalance).toBe(2000)
  })

  it('should get budgets summary from next month', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get(`/budgets/summary/${moment().add(1, 'month').year()}/${moment().add(1, 'month').month()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    // Assert
    expect(response.body.incomes).toHaveLength(1)
    expect(response.body.outcomes).toHaveLength(1)
    expect(response.body.predictedIncomeValue).toBe(2000)
    expect(response.body.predictedOutcomeValue).toBe(1000)
    expect(response.body.predictedBalance).toBe(1000)
    expect(response.body.actualIncomeValue).toBe(0)
    expect(response.body.actualOutcomeValue).toBe(0)
    expect(response.body.actualBalance).toBe(0)
  })
})