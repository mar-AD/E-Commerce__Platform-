import { NestFactory } from '@nestjs/core';
import { AdminsModule } from './admins.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path'
import { ADMINS_PACKAGE_NAME } from '@app/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AdminsModule);
    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>(
      {
        transport: Transport.GRPC,
        options: {
          protoPath: join(__dirname, '../proto/admins.proto'),
          package: ADMINS_PACKAGE_NAME,
          url: '0.0.0.0:50055',
        }
      }
    )

    app.connectMicroservice<MicroserviceOptions>(
      {
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('POSTGRES_ADMINS_URI')],
          queue: configService.get<string>('RABBITMQ_ADMINS_QUEUE'),
          queueOptions: {durable: true },
          noAck: false,
          persistent: true,
        }
      }
    )
    await app.startAllMicroservices()
    console.log('admins microservice is running (grpc, rmq)');
  }catch (err){
    console.log('Error starting the admins microservice:', err);
  }
}
bootstrap();
