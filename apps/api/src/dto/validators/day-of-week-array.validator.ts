import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';

const VALID_DAYS = Object.values(DayOfWeek);

export function IsDayOfWeekArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDayOfWeekArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!Array.isArray(value)) {
            return false;
          }
          // Check all values are valid DayOfWeek
          if (!value.every((item) => VALID_DAYS.includes(item))) {
            return false;
          }
          // Check no duplicates
          const uniqueValues = new Set(value);
          return uniqueValues.size === value.length;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an array of unique DayOfWeek values (mon, tue, wed, thu, fri, sat, sun)`;
        },
      },
    });
  };
}
