import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
// import { UsersService } from '../users.service'
import { StocksService } from '../stocks.service'

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueStockValidator implements ValidatorConstraintInterface {
  constructor(private readonly service: StocksService) { }

  async validate(
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    try {
      const stock = await this.service.findStockByTicker(value)
      return !stock
    } catch (error) {
      console.error(error)
      return false
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property ?? 'Property'} already exists.`
  }
}

export const IsUniqueStock = (validationOptions?: ValidationOptions) => {
  return (object: object, property: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: property,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueStockValidator,
    })
  }
}