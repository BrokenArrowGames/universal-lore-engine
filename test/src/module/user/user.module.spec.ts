import { TestBed } from '@automock/jest';
import { UserModule } from '@mod/user/user.module';

describe('UserModule', () => {
  let module: UserModule;

  beforeEach(async () => {
    const { unit } = TestBed.create(UserModule).compile();

    module = unit;
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
