import { Injectable, PipeTransform } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { genSalt } from 'bcrypt'

@Injectable()
export class HashPasswordPipe implements PipeTransform {
  async transform(password: string) {
    const SALT_RANDOMS = 10
    const saltGenerated = await genSalt(SALT_RANDOMS)
    const hashedPassword = await bcrypt.hash(password, saltGenerated)
    return hashedPassword
  }
}