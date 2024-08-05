import { TestBed } from "@automock/jest";
import { AuthController } from "@mod/auth/auth.controller";
import { AuthService } from "@mod/auth/auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let _service: AuthService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AuthController).compile();

    controller = unit;
    _service = unitRef.get(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
