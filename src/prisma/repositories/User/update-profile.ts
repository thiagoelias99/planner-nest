import { PrismaService } from '../../prisma-service.ts'
import { UpdateUserDto } from '../../../resources/users/dto/update-user.dto'

export async function updateProfileQuery(userId: string, data: UpdateUserDto, prima: PrismaService) {
  const { city, country, state, ...rest } = data
  const { theme, language, ...user } = rest

  const userFromDb = await prima.user.update({
    where: { id: userId },
    data: {
      ...user,
      Address: {
        update: {
          city,
          country,
          state
        }
      },
      Preferences: {
        update: {
          theme,
          language
        }
      }
    }
  })

  return userFromDb.id
}