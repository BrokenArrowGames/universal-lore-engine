import { RoleName } from '@/module/auth/role/types';
import { AppLogger } from '@/module/logger/logger.service';
import { UserService } from '@/module/user/user.service';
import { Config, INFER } from '@/util/config';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly SYS_USER_NAME: string;
  private readonly ROOT_USER_NAME: string;
  private readonly ROOT_USER_PASS: string;
  private readonly ROOT_USER_MAIL: string;
  private readonly TEST_USER_NAME?: string;
  private readonly TEST_USER_PASS?: string;
  private readonly TEST_USER_MAIL?: string;

  constructor(
    private readonly logger: AppLogger,
    private readonly userService: UserService,
    configService: ConfigService<Config>,
  ) {
    this.SYS_USER_NAME = configService.getOrThrow("app.sysUser", INFER);
    this.ROOT_USER_NAME = configService.getOrThrow("user.root.name", INFER);
    this.ROOT_USER_PASS = configService.getOrThrow("user.root.password", INFER);
    this.ROOT_USER_MAIL = configService.getOrThrow("user.root.email", INFER);
    this.TEST_USER_NAME = configService.get("user.test.name", INFER);
    this.TEST_USER_PASS = configService.get("user.test.password", INFER);
    this.TEST_USER_MAIL = configService.get("user.test.email", INFER);
  }

  async onApplicationBootstrap() {
    const [{ id: sysUserId }] = await this.userService.getFilteredUserList({ id: -1, name: this.SYS_USER_NAME, ability: undefined }, { name: this.SYS_USER_NAME });
    await this.createUserIfNotExist(sysUserId, this.ROOT_USER_NAME, this.ROOT_USER_PASS, this.ROOT_USER_MAIL, RoleName.ADMIN);
    if (this.TEST_USER_NAME && this.TEST_USER_PASS && this.TEST_USER_MAIL) {
      await this.createUserIfNotExist(sysUserId, this.TEST_USER_NAME, this.TEST_USER_PASS, this.TEST_USER_MAIL);
    }
  }

  async createUserIfNotExist(sysUserId: number, name: string, password: string, email: string, role: RoleName = RoleName.USER) {
    const result = await this.userService.getFilteredUserList({ id: sysUserId,  name: this.SYS_USER_NAME, ability: undefined }, { name });
    if (result.length > 0) {
      this.logger.log(`Found user: '${name}'`)
      return;
    }
    
    this.logger.log(`Creating user: '${name}'`);
    await this.userService.createUser({ id: sysUserId, name: this.SYS_USER_NAME, ability: null }, { name, password, email, role });
  }
}
