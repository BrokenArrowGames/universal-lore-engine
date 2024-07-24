import { LoggerInterceptor } from '@mod/logger/logger.interceptor';
import { AppLogger } from '@mod/logger/logger.service';

describe('LoggerInterceptor', () => {
  let interceptor: LoggerInterceptor;

  beforeEach(async () => {
    interceptor = new LoggerInterceptor(new AppLogger());
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
