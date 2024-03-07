import { Injectable } from '@nestjs/common'
import { UsersRepository } from './users.repository'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) { }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email)
  }

  async create(data: CreateUserDto) {
    const id = await this.userRepository.create(data)
    return this.userRepository.getProfile(id)
  }

  async getProfile(userId: string) {
    return this.userRepository.getProfile(userId)
  }

  async updateProfile(userId: string, data: UpdateUserDto) {
    await this.userRepository.updateProfile(userId, data)
    return this.userRepository.getProfile(userId)
  }

  async delete(userId: string) {
    return this.userRepository.deleteById(userId)
  }
}
