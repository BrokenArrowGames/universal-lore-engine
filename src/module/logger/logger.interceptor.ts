import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from './logger.service';
import { AppRequest, AppResponse } from '@util/app-request';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('HttpInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<AppRequest>();
    const res = context.switchToHttp().getResponse<AppResponse>();
    this.logger.setContext(context.getHandler().name);

    this.logger.log({
      message: 'request',
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('user-agent') || '',
      userId: req.user?.id ?? null,
      sessionId: req.session?.id ?? null,
      correlationId: req.correlationId,
      body: req.body ?? null,
    });

    return next.handle().pipe(
      tap((data) => {
        this.logger.log({
          message: 'response',
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          sessionId: req.session?.id ?? null,
          correlationId: req.correlationId,
          body: data ? data : null,
        });
      }),
    );
  }
}
