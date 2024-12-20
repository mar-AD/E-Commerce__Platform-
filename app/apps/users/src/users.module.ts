import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/users/.env', './.env']
    }),
    CommonModule,

  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'RMQ_CONSUMER',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_USERS_QUEUE'),
            queueOptions: { durable: true },
          }
        })
      },
      inject: [ConfigService]
    }
  ],
  exports:[ 'RMQ_CONSUMER' ]
})
export class UsersModule {}
