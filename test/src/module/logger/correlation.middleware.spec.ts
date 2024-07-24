import { CorrelationMiddleware } from '@mod/logger/correlation.middleware';

describe('CorrelationMiddleware', () => {
  let middleware: CorrelationMiddleware;

  beforeEach(async () => {
    middleware = new CorrelationMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });
});
