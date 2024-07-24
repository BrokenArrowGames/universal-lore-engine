import { TestBed } from '@automock/jest';
import { UserEntity } from '@db/entity/user.entity';
import { AuthService } from '@mod/auth/auth.service';
import { UserDto, UserEntityFromDto } from '@mod/user/user.dto';
import { UserService } from '@mod/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RandomMockUser } from '@test/util/mock-user';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let _authService: jest.Mocked<AuthService>;
  let _userRepo: jest.Mocked<Repository<UserEntity>>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UserService).compile();

    service = unit;
    _authService = unitRef.get(AuthService);
    _userRepo = unitRef.get(getRepositoryToken(UserEntity) as string);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return value', async () => {
      const user = RandomMockUser();
      const expected: UserDto = {
        id: user.id,
        name: user.name
      };
  
      _userRepo.findOneOrFail.mockResolvedValue(user);
  
      const result = await service.getUserById(1);
      expect(result).toStrictEqual(expected);
    });

    it('should not have extra properties', async () => {
      const user = RandomMockUser();
      const expected: UserDto = {
        id: user.id,
        name: user.name
      };
  
      _userRepo.findOneOrFail.mockResolvedValue(user);
  
      const result = await service.getUserById(1);
      expect(result).toStrictEqual(expected);
    });
  })
});
