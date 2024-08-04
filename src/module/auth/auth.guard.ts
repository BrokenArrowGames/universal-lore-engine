import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppRequest } from '@util/app-request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { UserEntity } from '@db/entity/user.entity';
import { AppLogger } from '@mod/logger/logger.service';
import { createAbility } from './util/ability';
import { RoleName } from './role/types';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly logger: AppLogger,
  ) {}

  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: AppRequest = context.switchToHttp().getRequest();
    const clazz = context.getClass();
    const handler = context.getHandler();
    return this.validateRequest(req, clazz, handler);
  }

  private async validateRequest(req: AppRequest, clazz: any, handler: any): Promise<boolean> {
    if (req.session?.token) {
      const user = await this.userRepo.findOneByOrFail({
        name: req.session?.username,
      });

      req.user = {
        id: user.id,
        name: user.name,
        role: user.role,
        ability: createAbility(user),
      };

      console.log(req.user?.role ?? "undefined/guest", "with session");
      return true;
    }

    const metadata = Reflect.getMetadata("Controller:AllowGuestSession", clazz.prototype[handler.name]);
    if (metadata === true) {
      req.user = {
        id: 0,
        name: "guest",
        role: RoleName.GUEST,
        ability: createAbility({ id: 0, role: RoleName.GUEST })
      };
      
      console.log(req.user?.role ?? "undefined/guest", "without session");
      return true;
    }

    console.log(req.user?.role ?? "undefined/guest", "access denied");
    this.logger.log({
      message: 'request',
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('user-agent') || '',
      userId: req.user?.id ?? null,
      sessionId: req.session?.id ?? null,
      correlationId: req.correlationId,
      body: req.body ?? null,
    });
    return false;
  }
}
