import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { TodosService } from '../todos.service'

@Injectable()
@ValidatorConstraint({ async: true })
export class TodoExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly todosService: TodosService) { }

  async validate(
    value: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    try {
      const todo = await this.todosService.findById(value)
      return !!todo
    } catch (error) {
      return false
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property ?? 'Property'} not exists.`
  }
}

export const TodoExists = (validationOptions?: ValidationOptions) => {
  return (object: object, property: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: property,
      options: validationOptions,
      constraints: [],
      validator: TodoExistsValidator,
    })
  }
}