import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return `
    Welcome to the API of the project "Nest Template Todo"!
    You can find the documentation at
    https://github.com/thiagoelias99/nest-template-todo
    `
  }
}
