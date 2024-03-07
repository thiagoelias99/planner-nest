import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import * as bcrypt from 'bcrypt'
import { AuthDto } from './auth.dto'
import { UsersService } from '../users/users.service'
import { ApiProperty } from '@nestjs/swagger'

export interface JwtPayload {
  id: string,
  email: string,
  name: string
}

export class AuthResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlmMTQzZWRhLTNiNzgtNGQ1Zi04NjhkLWJlZDA2N2Y4OTc4MiIsImVtYWlsIjoidGhpYWdvOUBlbWFpbC5jb20iLCJuYW1lIjoiVGhpYWdvIEVsaWFzIiwiaWF0IjoxNzA1MTY2MDMwLCJleHAiOjE3MDU0MjUyMzB9.RNuX0GyDcWxRsMHs7eholA_jKeWeGbuo_14vsKPMe-s', description: 'Personal token for protected routes access' }) accessToken: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) { }

  async login({ password, email }: AuthDto) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('Email or password invalid')
    if (user.email !== email) throw new UnauthorizedException('Email or password invalid')

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) throw new UnauthorizedException('Email or password invalid')

    //Generate JWT
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    }

    const accessToken = await this.jwtService.sign(payload)

    return { accessToken }
  }
}