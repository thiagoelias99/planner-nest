import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { AuthService, AuthResponse } from './auth.service'
import { AuthDto } from './auth.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Controller('')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login and receive JWT Token' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: AuthResponse,
  })
  async login(@Body() data: AuthDto): Promise<AuthResponse> {
    return this.authService.login(data)
  }
}