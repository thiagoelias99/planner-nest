import { PrismaService } from 'src/prisma/prisma-service.ts'
import { User } from 'src/resources/users/entities/user.entity'
import { userToEntityDto } from './dto/get-user'

export async function getProfileQuery(userId: string, prisma: PrismaService): Promise<User> {

  const userFromDb = await prisma.user.findUnique({
    where: {
      id: userId
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