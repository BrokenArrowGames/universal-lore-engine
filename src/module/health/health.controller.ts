import { Controller, Get } from '@nestjs/common';
import { HealthDto } from './health.dto';
import * as Constants from '@gen/util/constants';

@Controller('health')
export class HealthController {
  @Get()
  public async health(): Promise<HealthDto> {
    return {
      status: 'ok',
      version: Constants.APP_VERSION,
      build: {
        id: Constants.BUILD_ID,
        timestamp: Constants.BUILD_TIMESTAMP,
      },
    };
  }
}
