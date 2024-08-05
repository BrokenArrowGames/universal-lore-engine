import { Injectable, NestMiddleware } from "@nestjs/common";
import { v4 as UUID } from "uuid";
import { AppRequest, AppResponse, NextFunction } from "@util/app-request";

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  public use(req: AppRequest, res: AppResponse, next: NextFunction) {
    req.correlationId = req.get("App-Correlation-Id") ?? UUID();
    res.append("App-Correlation-Id", req.correlationId);
    next();
  }
}
