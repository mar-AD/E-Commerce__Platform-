import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ClientsModule, Transport } from '@nestjs/microservices';
import { CommonModule, LoggerService } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/users/.env', './.env']
    }),
    CommonModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('POSTGRES_USERS_URI'),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UsersEntity]),

    // ClientsModule.registerAsync( [
    //   {
    //     name: 'RMQ_CONSUMER',
    //     useFactory: (configService: ConfigService) => ({
    //       transport: Transport.RMQ,
    //       options: {
    //         urls: [configService.get<string>('RABBITMQ_URL')],
    //         queue: configService.get<string>('RABBITMQ_USERS_QUEUE'),
    //         queueOptions: { durable: true },
    //         noAck: false, // Ensures messages are acknowledged only after successful processing
    //         persistent: true,// Ensures that the messages are saved to disk, so they survive server restarts or crashes. This guarantees that messages will not be lost in case of failure.
    //       },
    //     }),
    //     inject: [ConfigService]
    //   }
    // ])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[]
})
export class UsersModule {}
