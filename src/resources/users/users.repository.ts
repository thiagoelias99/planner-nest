import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>
  abstract create(data: CreateUserDto): Promise<string>
  abstract getProfile(userId: string): Promise<User | null>
  abstract updateProfile(userId: string, data: UpdateUserDto): Promise<string>
  abstract deleteById(userId: string): Promise<void>
}