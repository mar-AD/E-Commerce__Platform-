import { Global, Module } from '@nestjs/common';
import { CommonService } from '@app/common/services/common.service';
import { JwtTokenService } from '@app/common/services/jwtoken.service';
import { LoggerService } from '@app/common/services/logger.service';
import { JwtStrategy } from '@app/common/utils';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from '@app/common/services/global-cron.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@app/common/types';
import { join } from 'path';

@Global()
@Module({
  imports:[
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),

      inject: [ConfigService],
    }),
    ClientsModule.register([{
      name: 'authService',
      transport: Transport.GRPC,
      options: {
        package: AUTH_PACKAGE_NAME,
        protoPath: join(__dirname, '../proto/auth.proto'),
        url: 'auth:50051',
      }
    }])
  ],
  providers: [CommonService, JwtTokenService, LoggerService, JwtStrategy, CronService],
  exports: [CommonService, JwtTokenService, LoggerService, JwtStrategy, CronService],
})
export class CommonModule {}
