import { TestBed } from "@automock/jest";
import { LoggerInterceptor } from "@mod/logger/logger.interceptor";

describe("LoggerInterceptor", () => {
  let interceptor: LoggerInterceptor;

  beforeEach(async () => {
    const { unit } = TestBed.create(LoggerInterceptor).compile();

    interceptor = unit;
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });
});
