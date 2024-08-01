import { TestBed } from '@automock/jest';
import { createMongoAbility, ForbiddenError } from '@casl/ability';
import { AppAbility } from '@mod/auth/util/ability';
import { AuthAction } from '@mod/auth/util/auth-actions';
import { AuthSubject } from '@mod/auth/util/auth-subjects';
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

  describe('createUser', () => {
    it('should throw ForbiddenError when auth fails', () => {
      const ability = createMongoAbility();
      return expect(() => controller.createUser({ user: { ability } } as unknown as AppRequest, {} as CreateUserRequest))
        .toThrow(`Cannot execute "CREATE" on "USER"`);
    });

    it('should perform basic auth check', async () => {
      const errorSpy = jest.spyOn(ForbiddenError, 'from');
      const ability = createMongoAbility<AppAbility>([{ action: AuthAction.CREATE, subject: AuthSubject.USER }]);
      await controller.createUser({ user: { ability } } as unknown as AppRequest, {} as CreateUserRequest);
      return expect(errorSpy).toHaveBeenCalled();
    });

    it('calls user service', async () => {
      const ability = createMongoAbility<AppAbility>([{ action: AuthAction.CREATE, subject: AuthSubject.USER }]);
      await controller.createUser({ user: { ability } } as unknown as AppRequest, {} as CreateUserRequest);
      expect(service.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('readUser', () => {
    it('should throw ForbiddenError when auth fails', () => {
      const ability = createMongoAbility();
      return expect(() => controller.readUser({ user: { ability } } as unknown as AppRequest, 0))
        .toThrow(`Cannot execute "READ" on "USER"`);
    });

    it('should perform basic auth check', async () => {
      const errorSpy = jest.spyOn(ForbiddenError, 'from');
      const ability = createMongoAbility<AppAbility>([{ action: AuthAction.READ, subject: AuthSubject.USER }]);
      await controller.readUser({ user: { ability } } as unknown as AppRequest, 0);
      return expect(errorSpy).toHaveBeenCalled();
    });
    
    it('calls user service', async () => {
      const ability = createMongoAbility<AppAbility>([{ action: AuthAction.READ, subject: AuthSubject.USER }]);
      await controller.readUser({ user: { ability } } as unknown as AppRequest, 0);
      expect(service.getUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUser', () => {
    it('should throw ForbiddenError when auth fails', () => {
      const ability = createMongoAbility();
      return expect(() => controller.updateUser({ user: { ability } } as unknown as AppRequest, 0, {} as UpdateUserRequest))
        .toThrow(`Cannot execute "UPDATE" on "USER"`);
    });

    it('should perform basic auth check', async () => {
      const errorSpy = jest.spyOn(ForbiddenError, 'from');
      const ability = createMongoAbility<AppAbility>([{ action: AuthAction.UPDATE, subject: AuthSubject.USER }]);
      await controller.updateUser({ user: { ability } } as unknown as AppRequest, 0, {} as UpdateUserRequest);
      return expect(errorSpy).toHaveBeenCalled();
    });

    it('calls user service', async () => {
      const ability = createMongoAbility<AppAbility>([{ action: AuthAction.UPDATE, subject: AuthSubject.USER }]);
      await controller.updateUser({ user: { ability } } as unknown as AppRequest, 0, {} as UpdateUserRequest);
      expect(service.updateUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteUser', () => {
    it('should throw ForbiddenError when auth fails', () => {
      const ability = createMongoAbility();
      return expect(() => controller.deleteUser({ user: { ability } } as unknown as AppRequest, 0))
        .toThrow(`Cannot execute "DELETE" on "USER"`);
    });

    it('should perform basic auth check', async () => {
      const errorSpy = jest.spyOn(ForbiddenError, 'from');
      const ability = createMongoAbility<AppAbility>([{ action: AuthAction.DELETE, subject: AuthSubject.USER }]);
      await controller.deleteUser({ user: { ability } } as unknown as AppRequest, 0);
      return expect(errorSpy).toHaveBeenCalled();
    });

    it('calls user service', async () => {
      const ability = createMongoAbility<AppAbility>([{ action: AuthAction.DELETE, subject: AuthSubject.USER }]);
      await controller.deleteUser({ user: { ability } } as unknown as AppRequest, 0);
      expect(service.deleteUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFilteredUsers', () => {
    it('should throw ForbiddenError when auth fails', () => {
      const ability = createMongoAbility();
      return expect(() => controller.listUsers({ user: { ability } } as unknown as AppRequest, {}))
        .toThrow(`Cannot execute "LIST" on "USER"`);
    });

    it('should perform basic auth check', async () => {
      const errorSpy = jest.spyOn(ForbiddenError, 'from');
      const ability = createMongoAbility<AppAbility>([{ action: AuthAction.LIST, subject: AuthSubject.USER }]);
      await controller.listUsers({ user: { ability } } as unknown as AppRequest, {});
      return expect(errorSpy).toHaveBeenCalled();
    });

    it('calls user service', async () => {
      const ability = createMongoAbility<AppAbility>([{ action: AuthAction.LIST, subject: AuthSubject.USER }]);
      await controller.listUsers({ user: { ability } } as unknown as AppRequest, {});
      expect(service.getFilteredUserList).toHaveBeenCalledTimes(1);
    });
  });
});
