import { LoggerService, Scope, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Config, INFER } from "@util/config";
import pino from "pino";

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private readonly REDACTED: string;

  private context: string = "NestJS";
  private logger: pino.Logger;

  constructor(private readonly config?: ConfigService<Config>) {
    this.REDACTED = this.config.getOrThrow("constants.redacted", INFER);
    const transport = config.getOrThrow("app.local", INFER)
      ? {
          target: "pino-pretty",
          options: {
            levelFirst: true,
            singleLine: true,
            errorLikeObjectKeys: ["error", "cause", "stack"],
            errorProps: ["error", "cause", "stack"].join(","),
            ignore: "context,message,error.ability",
            messageFormat: "{context} - {message}",
          },
        }
      : undefined;

    this.logger = pino({
      level: this.config?.get("app.log", INFER) ?? "error",
      redact: {
        paths: ["*.auth_token", "*.password", "*.long_description"],
        censor: (value: string, path: string[]) => {
          if (path[path.length - 1] === "long_description") {
            return value.length > 32
              ? value.substring(0, 32 - 3) + "..."
              : value;
          }
          return this.REDACTED;
        },
      },
      transport,
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
    const msg: object
      = typeof message === "object" ? (message as object) : { message };
    const subContext = optionalParams[optionalParams.length - 1];
    if (typeof subContext === "string") {
      context += `.${subContext}`;
    }

    this.logger[level]({
      context: context,
      ...msg,
    });
  }

  public log(message: any, ...optionalParams: any[]) {
    this.printMessages("info", message, optionalParams);
  }

  public fatal(message: any, ...optionalParams: any[]) {
    this.printMessages("fatal", message, optionalParams);
  }

  public error(message: any, ...optionalParams: any[]) {
    this.printMessages("error", message, optionalParams);
  }

  public warn(message: any, ...optionalParams: any[]) {
    this.printMessages("warn", message, optionalParams);
  }

  public debug?(message: any, ...optionalParams: any[]) {
    this.printMessages("debug", message, optionalParams);
  }

  public verbose?(message: any, ...optionalParams: any[]) {
    this.printMessages("trace", message, optionalParams);
  }
}
