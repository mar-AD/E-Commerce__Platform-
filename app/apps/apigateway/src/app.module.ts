import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@app/common';

@Module({
  imports: [AuthModule,
    ConfigModule.forRoot({isGlobal: true}),
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
