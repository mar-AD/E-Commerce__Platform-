import { Module } from '@nestjs/common';
import { CommonService } from '@app/common/services/common.service';
import { JwtTokenService } from '@app/common/services/jwtoken.service';
import { LoggerService } from '@app/common/services/logger.service';
import { JwtStrategy } from '@app/common/utils';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from '@app/common/services/global-cron.service';


@Module({
  imports:[ScheduleModule.forRoot()],
  providers: [CommonService, JwtTokenService, LoggerService, JwtStrategy, CronService],
  exports: [CommonService, JwtTokenService, LoggerService, JwtStrategy, CronService],
})
export class CommonModule {}
