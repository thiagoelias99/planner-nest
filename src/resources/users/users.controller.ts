import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { HashPasswordPipe } from '../../pipes/hash-password.pipe'
import { AuthGuard, UserRequest } from '../../guards/auth.guard'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from './entities/user.entity'

@Controller('')
@ApiTags('User')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('signup')
  @ApiOperation({ summary: 'Signup a new user' })
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: User,
  })
  async create(
    @Body() data: CreateUserDto,
    @Body('password', HashPasswordPipe) hashedPassword: string
  ) {
    return this.usersService.create({ ...data, password: hashedPassword })
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user information and configuration ' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: User,
  })
  async getProfile(@Req() req: UserRequest) {
    return this.usersService.getProfile(req.user.id)
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user information ', description: 'Update user information and configuration, all the value are optionals' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: User,
  })
  async updateProfile(@Req() req: UserRequest, @Body() data: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.id, data)
  }
}
