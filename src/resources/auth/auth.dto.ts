import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'
import { CreateUserDto } from '../users/dto/create-user.dto'

export class AuthDto extends PickType(CreateUserDto, ['password']) {
    @ApiProperty({ example: 'thiago@email.com' }) @IsEmail() email: string
}