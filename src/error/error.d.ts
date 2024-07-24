interface ErrorConstructor {
  new (message?: string, options?: { cause?: unknown }): Error;
}

interface Error {
  cause?: unknown;
}
