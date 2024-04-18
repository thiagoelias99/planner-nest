import { Test, TestingModule } from '@nestjs/testing'
import { BudgetsService } from './budgets.service'
import { BudgetsRepository } from './budgets.repository'
import { BudgetPaymentMethodEnum } from './budgets.entity'


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
      value: 1999.99
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: 'Extra',
      expectedDay: new Date().getDate(),
      isIncome: true,
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
          },
        ],
      },
    })
  })

  it('should set use expected day value if passed', async () => {
    const data = {
      value: 1999.99,
      expectedDay: 10,
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: 'Extra',
      expectedDay: data.expectedDay,
      isIncome: true,
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
          },
        ],
      },
    })
  })

  it('should set use description value if passed', async () => {
    const data = {
      value: 1999.99,
      description: 'Salary',
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: data.description,
      expectedDay: new Date().getDate(),
      isIncome: true,
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
          },
        ],
      },
    })
  })

  it('should set use isIncome value if passed', async () => {
    const data = {
      value: 1999.99,
      isIncome: false,
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: 'Extra',
      expectedDay: new Date().getDate(),
      isIncome: data.isIncome,
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
          },
        ],
      },
    })
  })

  it('should set use consolidated value if passed', async () => {
    const data = {
      value: 1999.99,
      consolidated: false,
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: 'Extra',
      expectedDay: new Date().getDate(),
      isIncome: true,
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
          },
        ],
      },
    })
  })

  it('should set use paymentMethod value if passed', async () => {
    const data = {
      value: 1999.99,
      paymentMethod: BudgetPaymentMethodEnum.CREDIT,
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: false,
      description: 'Extra',
      expectedDay: new Date().getDate(),
      isIncome: true,
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
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: true,
      description: 'Extra',
      expectedDay: startDate.getDate(),
      isIncome: true,
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
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: true,
      description: 'Extra',
      expectedDay: startDate.getDate(),
      isIncome: true,
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
      isIncome: false,
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
      isIncome: data.isIncome,
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
    }

    await budgetsService.create('userId', data)

    expect(budgetsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: 'userId',
      isRecurrent: true,
      description: 'Extra',
      expectedDay: startDate.getDate(),
      isIncome: true,
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
          },
        ],
      },
    })
  })
})