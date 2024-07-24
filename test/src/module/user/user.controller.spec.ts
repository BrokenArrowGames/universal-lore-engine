import { TestBed } from '@automock/jest';
import { UserController } from '@mod/user/user.controller';
import { UserService } from '@mod/user/user.service';

describe('UserController', () => {
  let controller: UserController;
  let _service: UserService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UserController).compile();

    controller = unit;
    _service = unitRef.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
