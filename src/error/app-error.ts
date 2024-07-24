export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: string[],
    public readonly cause?: Error,
  ) {
    super(message);
  }
}
