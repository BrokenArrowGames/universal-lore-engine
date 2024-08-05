import { TestBed } from "@automock/jest";
import { AppLogger } from "@mod/logger/logger.service";

describe("AppLogger", () => {
  let service: AppLogger;

  beforeEach(async () => {
    const { unit } = TestBed.create(AppLogger).compile();

    service = unit;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
