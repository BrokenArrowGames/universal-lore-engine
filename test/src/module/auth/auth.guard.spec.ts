import { TestBed } from '@automock/jest';
import { AuthGuard } from '@mod/auth/auth.guard';

describe('AuthGuard', () => {
  let service: AuthGuard;

  beforeEach(async () => {
    const { unit } = TestBed.create(AuthGuard).compile();

    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
