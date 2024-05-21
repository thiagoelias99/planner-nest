import { Test, TestingModule } from '@nestjs/testing'
import { BudgetsService } from './budgets.service'
import { BudgetsRepository } from './budgets.repository'
import { BudgetClassEnum, BudgetPaymentMethodEnum } from './budgets.entity'

describe('BudgetsService', () => {
  let budgetsService: BudgetsService
  let budgetsRepository: BudgetsRepository

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        {
          provide: BudgetsRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(data => data),
          },
        },
      ],
    }).compile()

    budgetsService = moduleRef.get<BudgetsService>(BudgetsService)
    budgetsRepository = moduleRef.get<BudgetsRepository>(BudgetsRepository)
  })

  it('should be defined', () => {
    expect(budgetsService).toBeDefined()
  })

  it('should set default values if not provided', async () => {
    const data = {
      value: 1999.99,
      budgetClass: BudgetClassEnum.INCOME
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: 'Extra',
      expectedDay: new Date().getDate(),
      budgetClass: BudgetClassEnum.INCOME,
      paymentMethod: BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: true,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate: undefined,
            endDate: undefined,
          },
        ],
        registers: [
          {
            id: expect.any(String),
            value: data.value,
            date: expect.any(Date),
            checked: true,
            deleted: false
          },
        ],
      },
    })
  })

  it('should set use expected day value if passed', async () => {
    const data = {
      value: 1999.99,
      expectedDay: 10,
      budgetClass: BudgetClassEnum.INCOME
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: 'Extra',
      expectedDay: data.expectedDay,
      budgetClass: BudgetClassEnum.INCOME,
      paymentMethod: BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: true,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate: undefined,
            endDate: undefined,
          },
        ],
        registers: [
          {
            id: expect.any(String),
            value: data.value,
            date: expect.any(Date),
            checked: true,
            deleted: false
          },
        ],
      },
    })
  })

  it('should set use description value if passed', async () => {
    const data = {
      value: 1999.99,
      description: 'Salary',
      budgetClass: BudgetClassEnum.INCOME
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: data.description,
      expectedDay: new Date().getDate(),
      budgetClass: BudgetClassEnum.INCOME,
      paymentMethod: BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: true,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate: undefined,
            endDate: undefined,
          },
        ],
        registers: [
          {
            id: expect.any(String),
            value: data.value,
            date: expect.any(Date),
            checked: true,
            deleted: false
          },
        ],
      },
    })
  })

  it('should set use budgetClass value if passed', async () => {
    const data = {
      value: 1999.99,
      budgetClass: BudgetClassEnum.CREDIT_CARD,
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: 'Extra',
      expectedDay: new Date().getDate(),
      budgetClass: BudgetClassEnum.CREDIT_CARD,
      paymentMethod: BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: true,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate: undefined,
            endDate: undefined,
          },
        ],
        registers: [
          {
            id: expect.any(String),
            value: data.value,
            date: expect.any(Date),
            checked: true,
            deleted: false
          },
        ],
      },
    })
  })

  it('should set use consolidated value if passed', async () => {
    const data = {
      value: 1999.99,
      consolidated: false,
      budgetClass: BudgetClassEnum.CREDIT_CARD
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: 'Extra',
      expectedDay: new Date().getDate(),
      budgetClass: BudgetClassEnum.CREDIT_CARD,
      paymentMethod: BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: data.consolidated,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate: undefined,
            endDate: undefined,
          },
        ],
        registers: [
          {
            id: expect.any(String),
            value: data.value,
            date: expect.any(Date),
            checked: data.consolidated,
            deleted: false
          },
        ],
      },
    })
  })

  it('should set use paymentMethod value if passed', async () => {
    const data = {
      value: 1999.99,
      paymentMethod: BudgetPaymentMethodEnum.CREDIT,
      budgetClass: BudgetClassEnum.CASH_BOX
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: 'Extra',
      expectedDay: new Date().getDate(),
      budgetClass: BudgetClassEnum.CASH_BOX,
      paymentMethod: BudgetPaymentMethodEnum.CREDIT,
      value: data.value,
      consolidated: true,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate: undefined,
            endDate: undefined,
          },
        ],
        registers: [
          {
            id: expect.any(String),
            value: data.value,
            date: expect.any(Date),
            checked: true,
            deleted: false
          },
        ],
      },
    })
  })

  it('should set use startDate value if passed', async () => {
    const startDate = new Date('2021-01-01')
    const data = {
      value: 1999.99,
      startDate,
      budgetClass: BudgetClassEnum.CASH_BOX
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: true,
      description: 'Extra',
      expectedDay: startDate.getDate(),
      budgetClass: BudgetClassEnum.CASH_BOX,
      paymentMethod: BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: true,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate,
            endDate: undefined,
          },
        ],
        registers: [
          {
            id: expect.any(String),
            value: data.value,
            date: startDate,
            checked: true,
            deleted: false
          },
        ],
      },
    })
  })

  it('should set use endDate value if passed', async () => {
    const startDate = new Date('2021-01-01')
    const endDate = new Date('2021-12-31')
    const data = {
      value: 1999.99,
      startDate,
      endDate,
      budgetClass: BudgetClassEnum.INVESTMENT
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: true,
      description: 'Extra',
      expectedDay: startDate.getDate(),
      budgetClass: BudgetClassEnum.INVESTMENT,
      paymentMethod: BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: true,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate,
            endDate,
          },
        ],
        registers: [
          {
            id: expect.any(String),
            value: data.value,
            date: startDate,
            checked: true,
            deleted: false
          },
        ],
      },
    })
  })

  it('should set use all values if passed', async () => {
    const startDate = new Date('2021-01-01')
    const endDate = new Date('2021-12-31')
    const data = {
      value: 1999.99,
      budgetClass: BudgetClassEnum.INVESTMENT,
      description: 'Salary',
      expectedDay: 10,
      consolidated: false,
      startDate,
      endDate,
      paymentMethod: BudgetPaymentMethodEnum.CREDIT,
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: true,
      description: data.description,
      expectedDay: data.expectedDay,
      budgetClass: data.budgetClass,
      paymentMethod: data.paymentMethod,
      value: data.value,
      consolidated: data.consolidated,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate,
            endDate,
          },
        ],
        registers: [
          {
            id: expect.any(String),
            value: data.value,
            date: startDate,
            checked: data.consolidated,
            deleted: false
          },
        ],
      },
    })
  })

  it('should use startDate day if expectedDay is not passed', async () => {
    const startDate = new Date('2021-01-10')
    const data = {
      value: 1999.99,
      startDate,
      budgetClass: BudgetClassEnum.PENSION
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: true,
      description: 'Extra',
      expectedDay: startDate.getDate(),
      budgetClass: BudgetClassEnum.PENSION,
      paymentMethod: BudgetPaymentMethodEnum.DEBIT,
      value: data.value,
      consolidated: true,
      recurrenceHistory: {
        activePeriods: [
          {
            startDate,
            endDate: undefined,
          },
        ],
        registers: [
          {
            id: expect.any(String),
            value: data.value,
            date: startDate,
            checked: true,
            deleted: false,
          },
        ],
      },
    })
  })
})