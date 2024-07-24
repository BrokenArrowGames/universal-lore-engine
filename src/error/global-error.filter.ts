import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { ErrorResponse } from '@util/app-request';
import { AppLogger } from '@mod/logger/logger.service';
import { AppError } from './app-error';

@Catch(Error)
export class GlobalErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('EntityValidationErrorFilter');
  }

  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<any>();
    const res = ctx.getResponse<any>();

    const errRes: ErrorResponse = {
      status: 500,
      type: 'InternalServerErrorException',
      message: 'an unknown error has occured',
    };

    let cause = '';
    if (exception instanceof AppError) {
      errRes.status = exception.status;
      errRes.type = exception.name;
      errRes.message = exception.message;
      errRes.details = exception.details;
      cause = exception.cause?.toString();
    } else if (exception instanceof HttpException) {
      errRes.status = exception.getStatus();
      errRes.type = exception.name;
      errRes.message = exception.message;
      cause = exception.cause?.toString();
    } else {
      cause = exception.toString();
    }

    this.logger.error({
      ...errRes,
      correlationId: req.correlationId,
      cause,
    });
    this.logger.debug({
      error: exception,
      stack: exception.stack.split(/\n    /),
    });
    if (exception.cause instanceof Error) {
      this.logger.debug({
        error: exception.cause,
        stack: exception.cause?.stack?.split(/\n    /),
      });
    }
    res.status(errRes.status).json(errRes);
  }
}
