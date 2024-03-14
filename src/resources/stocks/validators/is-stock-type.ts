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
export class IsStockTypeValidator implements ValidatorConstraintInterface {
  constructor(private readonly service: StocksService) { }
  

  async validate(
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    try {
      const stockTypes = await this.service.getStockTypes()
      const found = stockTypes.find(stockType => stockType === value)
      return !!found
    } catch (error) {
      return false
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const message: string = `${validationArguments?.property} has a invalid option.`

    return message
  }
}

export const IsStockType = (validationOptions?: ValidationOptions) => {
  return (object: object, property: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: property,
      options: validationOptions,
      constraints: [],
      validator: IsStockTypeValidator,
    })
  }
}