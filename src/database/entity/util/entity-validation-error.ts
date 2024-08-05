import { ValidationError } from "class-validator";
import { BaseEntity } from "typeorm";
import { AppError } from "../../../error/app-error";

export class EntityValidationError extends AppError {
  constructor(
    public readonly entity: BaseEntity,
    errors: (ValidationError | string)[],
    cause?: Error,
  ) {
    super(
      403,
      "invalid record",
      errors.flatMap((err) =>
        err instanceof ValidationError ? Object.values(err.constraints) : err,
      ),
      cause,
    );
  }
}
