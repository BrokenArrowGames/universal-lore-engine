import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppRequest } from '@util/app-request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { UserEntity } from '@db/entity/user.entity';
import { AppLogger } from '@mod/logger/logger.service';

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
    const req = context.switchToHttp().getRequest();
    return this.validateRequest(req);
  }

  private async validateRequest(req: AppRequest): Promise<boolean> {
    if (req.session?.token) {
      const user = await this.userRepo.findOneByOrFail({
        name: req.session?.username,
      });
      req.user = { id: user.id, name: user.name };
      return true;
    }

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
