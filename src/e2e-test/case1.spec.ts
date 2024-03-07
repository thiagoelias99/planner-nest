/**
 * Test case 1
 * - Register a user
 * - Login and receive JWT
 * - Get profile
 * - Update profile
 * - Can't update password
 * - Can't update email
 * - Get updated profile
 * - Login and receive another JWT
 * - Get updated profile
 */

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { useContainer } from 'class-validator'

import { AppModule } from '../app.module'
import { CreateUserDto } from '../resources/users/dto/create-user.dto'
import { UpdateUserDto } from 'src/resources/users/dto/update-user.dto'
// import { response } from 'express'

const userLoginData = CreateUserDto.mock()
let accessToken: string
const updatedUser: UpdateUserDto = {
  firstName: 'Updated FirstName',
  lastName: 'User LastName',
  birthDate: new Date(),
  country: 'Updated Country',
  state: 'Updated State',
  city: 'Updated City',
  language: 'pt-br',
  theme: 'dark'
}

describe('Case 1 - E2E', () => {
  let app: INestApplication

  beforeEach(async () => {
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

  it('should get user profile', async () => {
    //Act
    const response = await request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    // Assert
    expect(response.body).toHaveProperty('id')
    expect(response.body.firstName).toEqual(userLoginData.firstName)
    expect(response.body.lastName).toEqual(userLoginData.lastName)
    expect(response.body.email).toEqual(userLoginData.email)
    expect(response.body.password).toBeUndefined()
    expect(response.body).toHaveProperty('createdAt')
    expect(response.body).toHaveProperty('updatedAt')
    expect(response.body.birthDate).toEqual(userLoginData.birthDate.toISOString())
    expect(response.body.address.country).toEqual(userLoginData.country)
    expect(response.body.address.state).toEqual(userLoginData.state)
    expect(response.body.address.city).toEqual(userLoginData.city)
    expect(response.body.preferences.language).toEqual(userLoginData.language)
    expect(response.body.preferences.theme).toEqual(userLoginData.theme)
  })

  it('should update user profile', async () => {
    //Act
    const response = await request(app.getHttpServer())
      .patch('/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedUser)
      .expect(200)
    // Assert
    expect(response.body).toHaveProperty('id')
  })

  it('should not update user password', async () => {
    //Act
    const response = await request(app.getHttpServer())
      .patch('/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ password: 'newPassword123##' })
      .expect(400)
    // Assert
    expect(response.body.message).toContain('property password should not exist')
  })

  it('should not update user email', async () => {
    //Act
    const response = await request(app.getHttpServer())
      .patch('/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'updatethis@eamil.com' })
      .expect(400)
    // Assert
    expect(response.body.message).toContain('property email should not exist')
  })

  it('should login and receive another JWT', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .post('/login')
      .send({ password: userLoginData.password, email: userLoginData.email })
      .expect(200)
    // Assert
    expect(response.body).toHaveProperty('accessToken')
    accessToken = response.body.accessToken
  })

  it('should get updated user profile', async () => {
    //Act
    const response = await request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    // Assert
    expect(response.body).toHaveProperty('id')
    expect(response.body.firstName).toEqual(updatedUser.firstName)
    expect(response.body.lastName).toEqual(updatedUser.lastName)
    expect(response.body.email).toEqual(userLoginData.email)
    expect(response.body.password).toBeUndefined()
    expect(response.body).toHaveProperty('createdAt')
    expect(response.body).toHaveProperty('updatedAt')
    expect(response.body.birthDate).toEqual(updatedUser.birthDate.toISOString())
    expect(response.body.address.country).toEqual(updatedUser.country)
    expect(response.body.address.state).toEqual(updatedUser.state)
    expect(response.body.address.city).toEqual(updatedUser.city)
    expect(response.body.preferences.language).toEqual(updatedUser.language)
    expect(response.body.preferences.theme).toEqual(updatedUser.theme)
  })
})