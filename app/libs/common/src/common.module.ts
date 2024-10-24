import { Module } from '@nestjs/common';
import { CommonService } from '@app/common/services/common.service';
import { JwtTokenService } from '@app/common/services/jwtoken.service';
import { LoggerService } from '@app/common/services/logger.service';
import { GrpcException, JwtStrategy } from '@app/common/utils';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from '@app/common/services/global-cron.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// import { GrpcExceptionFilter } from '@app/common/utils/grpc';


@Module({
  imports:[
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),

      inject: [ConfigService],
    }),
  ],
  providers: [CommonService, JwtTokenService, LoggerService, JwtStrategy, CronService, GrpcException],
  exports: [CommonService, JwtTokenService, LoggerService, JwtStrategy, CronService, GrpcException],
})
export class CommonModule {}
