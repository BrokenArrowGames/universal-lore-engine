import { TestBed } from '@automock/jest';
import { UserController } from '@mod/user/user.controller';
import { CreateUserRequest, UpdateUserRequest } from '@mod/user/user.dto';
import { UserService } from '@mod/user/user.service';
import { AppRequest } from '@util/app-request';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UserController).compile();

    controller = unit;
    service = unitRef.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFilteredUsers', () => {
    it('calls user service', async () => {
      await controller.getFilteredUsers({});
      expect(service.getFilteredUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('calls user service', async () => {
      await controller.getUserById({ id: 0 });
      expect(service.getUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('calls user service', async () => {
      await controller.createUser({} as AppRequest, {} as CreateUserRequest);
      expect(service.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUser', () => {
    it('calls user service', async () => {
      await controller.updateUser({} as AppRequest, { id: 0 }, {} as UpdateUserRequest);
      expect(service.updateUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteUser', () => {
    it('calls user service', async () => {
      await controller.deleteUser({} as AppRequest, { id: 0 });
      expect(service.deleteUser).toHaveBeenCalledTimes(1);
    });
  });
});
