import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaModule } from '../../prisma/prisma.module'
import { UniqueEmailValidator } from './validators/unique-email.validator'

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers:
    [
      UsersService,
      UniqueEmailValidator
    ],
  exports: [UsersService],
})
export class UsersModule { }
