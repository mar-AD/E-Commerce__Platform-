import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersEntity } from './entities/orders.entity';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/orders/.env', './.env']
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('POSTGRES_ORDERS_URI'),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([OrdersEntity]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: 'RMQ_USERS_CLIENT',
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
      inject: [ConfigService],
    },
    {
      provide: 'RMQ_AUTH_CLIENT',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_AUTH_QUEUE'),
            queueOptions: { durable: true },
          }
        })
      },
      inject: [ConfigService],
    },
    {
      provide: 'RMQ_EMAIL_CLIENT',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_EMAIL_QUEUE'),
            queueOptions: { durable: true },
          }
        })
      },
      inject: [ConfigService],
    },
    {
      provide: 'RMQ_PRODUCTS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_PRODUCTS_QUEUE'),
            queueOptions: { durable: true },
          }
        })
      },
    }
  ],
  exports: [
    'RMQ_USERS_CLIENT',
    'RMQ_EMAIL_CLIENT',
    'RMQ_AUTH_CLIENT',
    'RMQ_PRODUCTS_CLIENT'
  ],
})
export class OrdersModule {}
