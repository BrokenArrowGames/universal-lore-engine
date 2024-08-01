import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { AppRequest, AppResponse, ErrorResponse } from '@util/app-request';
import { AppLogger } from '@mod/logger/logger.service';
import { AppError } from './app-error';
import { ForbiddenError } from '@casl/ability';
import { Request, Response } from 'express';

@Catch(Error)
export class GlobalErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('GlobalErrorFilter');
  }

  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<AppRequest>();
    const res = ctx.getResponse<Response>();

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
    } else if (exception instanceof ForbiddenError) {
      errRes.status = 403;
      errRes.type = ForbiddenError.name;
      errRes.message = exception.message;
      cause = exception.cause?.toString();
    } else {
      cause = exception.toString();
    }

    this.logger.error({
      method: req.method,
      url: req.originalUrl,
      ...errRes,
      correlationId: req.correlationId,
      cause
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
