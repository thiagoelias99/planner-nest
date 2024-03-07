/**
 * Test case 2
 * - Register a user
 * - Login and receive JWT
 * - Create 5 To Dos
 * - Get All To Dos
 * - Check a todo
 * - Update a todo
 * - Delete a todo
 */

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { useContainer } from 'class-validator'

import { AppModule } from '../app.module'
import { CreateUserDto } from '../resources/users/dto/create-user.dto'

const userLoginData = CreateUserDto.mock()
let accessToken: string

const todosData = [
  {
    title: 'Todo 1',
    description: 'Todo 1 description',
  },
  {
    title: 'Todo 2',
    description: 'Todo 2 description',
  },
  {
    title: 'Todo 3',
    description: 'Todo 3 description',
    date: new Date().toISOString(),
  },
  {
    title: 'Todo 4',
    description: 'Todo 4 description',
    date: new Date().toISOString(),
  },
  {
    title: 'Todo 5',
    description: 'Todo 5 description',
  },
]

describe('Case 2 - E2E', () => {
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

  it('should create 5 To Dos', async () => {
    // Act
    const todosMap = todosData.map(todo => {
      return request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(todo)
        .expect(201)
    })

    await Promise.all(todosMap)
  })

  it('should get all To Dos', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    // Assert
    expect(response.body.items).toHaveLength(5)
    expect(response.body.count).toEqual(5)
    expect(response.body.items).toContainEqual(expect.objectContaining({ title: 'Todo 1' }))
    expect(response.body.items).toContainEqual(expect.objectContaining({ title: 'Todo 2' }))
    expect(response.body.items).toContainEqual(expect.objectContaining({ title: 'Todo 3' }))
    expect(response.body.items).toContainEqual(expect.objectContaining({ title: 'Todo 4' }))
    expect(response.body.items).toContainEqual(expect.objectContaining({ title: 'Todo 5' }))
  })

  it('should check and update a todo', async () => {
    // Arrange
    const response = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    // Act
    await request(app.getHttpServer())
      .patch('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ id: response.body.items[0].id, completed: true, title: 'Todo with Check' })
      .expect(200)

    await request(app.getHttpServer())
      .patch('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ id: response.body.items[1].id, title: 'Todo title updated', description: 'Todo description updated' })
      .expect(200)

    const responseUpdated = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    // Assert
    expect(responseUpdated.body.items).toHaveLength(5)
    expect(responseUpdated.body.count).toEqual(5)
    expect(responseUpdated.body.items).toContainEqual(expect.objectContaining({ title: 'Todo with Check', completed: true }))
    expect(responseUpdated.body.items).toContainEqual(expect.objectContaining({ title: 'Todo title updated', description: 'Todo description updated' }))
  })

  it('should delete a todo', async () => {
    // Arrange
    const response = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    // Act
    await request(app.getHttpServer())
      .delete('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ id: response.body.items[0].id })
      .expect(200)

    const responseUpdated = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    // Assert
    expect(responseUpdated.body.items).toHaveLength(4)
    expect(responseUpdated.body.count).toEqual(4)
  })
})