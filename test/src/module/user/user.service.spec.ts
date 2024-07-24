import { TestBed } from '@automock/jest';
import { UserEntity } from '@db/entity/user.entity';
import { AuthService } from '@mod/auth/auth.service';
import { UserService } from '@mod/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let _authService: AuthService;
  let _userRepo: Repository<UserEntity>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UserService).compile();

    service = unit;
    _authService = unitRef.get(AuthService);
    _userRepo = unitRef.get(getRepositoryToken(UserEntity) as string);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
