import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

interface ErrorResponse {
  code: string;
  message: string;
  details?: string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const { method, url, body, query, params } = request;

    // Log input data at debug level for troubleshooting
    this.logger.debug(`Request ${method} ${url}`);
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      this.logger.debug(
        `HTTP Exception ${method} ${url}: ${exception.getStatus()} - ${exception.message} - ${JSON.stringify(exception.getResponse())}`,
      );

      this.logger.debug(
        `Stack trace ${exception instanceof Error ? exception.stack : 'No stack trace available'}`,
      );
      
      if (query && Object.keys(query).length > 0) {
        this.logger.debug(`Query params: ${JSON.stringify(query)}`);
      }
      
      if (params && Object.keys(params).length > 0) {
        this.logger.debug(`Route params: ${JSON.stringify(params)}`);
      }
      
      if (body && Object.keys(body).length > 0) {
        this.logger.debug(`Request body: ${JSON.stringify(body)}`);
      }
      
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (exception instanceof NotFoundException) {
        errorResponse = {
          code: 'NOT_FOUND',
          message: this.extractMessage(exceptionResponse),
        };
      } else if (exception instanceof BadRequestException) {
        errorResponse = {
          code: 'VALIDATION_ERROR',
          message: this.extractMessage(exceptionResponse),
          details: this.extractDetails(exceptionResponse),
        };
      } else if (exception instanceof ConflictException) {
        errorResponse = {
          code: 'CONFLICT',
          message: this.extractMessage(exceptionResponse),
        };
      } else if (exception instanceof ForbiddenException) {
        // Map Forbidden to various business error codes based on message
        const message = this.extractMessage(exceptionResponse);
        if (message.includes('past')) {
          errorResponse = {
            code: 'TIME_IN_PAST',
            message,
          };
        } else if (message.includes('working hours')) {
          errorResponse = {
            code: 'OUTSIDE_WORKING_HOURS',
            message,
          };
        } else if (message.includes('bookings')) {
          errorResponse = {
            code: 'HAS_BOOKINGS',
            message,
          };
        } else {
          errorResponse = {
            code: 'SLOT_UNAVAILABLE',
            message,
          };
        }
      } else {
        errorResponse = {
          code: 'VALIDATION_ERROR',
          message: this.extractMessage(exceptionResponse),
        };
      }
    } else {
      this.logger.debug(
        `Unhandled Exception ${method} ${url}: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private extractMessage(response: string | object): string {
    if (typeof response === 'string') {
      return response;
    }
    if (typeof response === 'object' && response !== null) {
      const message = (response as { message?: string | string[] }).message;
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      if (typeof message === 'string') {
        return message;
      }
      return 'An error occurred';
    }
    return 'An error occurred';
  }

  private extractDetails(response: string | object): string[] | undefined {
    if (typeof response === 'object' && response !== null) {
      const resp = response as { message?: string | string[] };
      if (Array.isArray(resp.message)) {
        return resp.message;
      }
    }
    return undefined;
  }
}
