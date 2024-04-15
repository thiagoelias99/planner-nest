import { PrismaService } from '../../prisma-service.ts'
import { User } from '../../../resources/users/entities/user.entity'
import { userToEntityDto } from './dto/get-user'

export async function findByEmailQuery(email: string, prisma: PrismaService): Promise<User | null> {
  const userFromDb = await prisma.user.findUnique({
    where: {
      email
    },
    include: {
      Address: true,
      Preferences: true
    }
  })

  if (!userFromDb) {
    return null
  }

  return userToEntityDto(userFromDb)
}