import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
// import { GrpcExceptionFilter } from '@app/common';
// import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [AuthModule,
    ConfigModule.forRoot({isGlobal: true})
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
