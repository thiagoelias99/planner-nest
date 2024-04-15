import { PrismaService } from '../../prisma-service.ts'
import { CreateUserDto } from '../../../resources/users/dto/create-user.dto'

export async function createUserQuery(data: CreateUserDto, prisma: PrismaService): Promise<string> {
  const userFromDb = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      birthDate: data.birthDate,
      Address: {
        create: {
          country: data.country,
          city: data.city,
          state: data.state
        }
      },
      Preferences: {
        create: {
          language: data.language,
          theme: data.theme
        }
      }

    }
  })


  return userFromDb.id
}