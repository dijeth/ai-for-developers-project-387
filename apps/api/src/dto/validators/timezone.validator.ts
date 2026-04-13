import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { registerDecorator } from 'class-validator';

/**
 * Validates that a string is a valid IANA timezone identifier.
 * Uses Intl.DateTimeFormat to check if timezone is supported.
 */
export function IsTimezone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTimezone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') {
            return false;
          }

          try {
            // Intl.DateTimeFormat will throw if timezone is invalid
            Intl.DateTimeFormat(undefined, { timeZone: value }).format(new Date());
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid IANA timezone identifier (e.g., Europe/Moscow, America/New_York)`;
        },
      },
    });
  };
}
