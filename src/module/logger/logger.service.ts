import { LoggerService, Scope, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config, INFER } from '@util/config';
import pino from 'pino';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context: string = 'NestJS';
  private logger: pino.Logger;

  constructor(private readonly config?: ConfigService<Config>) {
    this.logger = pino({
      level: this.config?.get('app.local', INFER) ? 'debug' : 'info',
      redact: ['*.auth_token', '*.password'],
    });
  }

  public setContext(context: string) {
    this.context = context;
  }

  protected printMessages(
    level: string,
    message: object,
    optionalParams: any[],
  ) {
    let context = this.context;
    const msg: object =
      typeof message === 'object' ? (message as object) : { message };
    const subContext = optionalParams[optionalParams.length - 1];
    if (typeof subContext === 'string') {
      context += `.${subContext}`;
    }

    this.logger[level]({
      context: context,
      ...msg,
    });
  }

  public log(message: any, ...optionalParams: any[]) {
    this.printMessages('info', message, optionalParams);
  }
  public fatal(message: any, ...optionalParams: any[]) {
    this.printMessages('fatal', message, optionalParams);
  }
  public error(message: any, ...optionalParams: any[]) {
    this.printMessages('error', message, optionalParams);
  }
  public warn(message: any, ...optionalParams: any[]) {
    this.printMessages('warn', message, optionalParams);
  }
  public debug?(message: any, ...optionalParams: any[]) {
    this.printMessages('debug', message, optionalParams);
  }
  public verbose?(message: any, ...optionalParams: any[]) {
    this.printMessages('trace', message, optionalParams);
  }
}
