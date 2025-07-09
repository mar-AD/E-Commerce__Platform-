import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH_PACKAGE_NAME } from '@app/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {

  try {

    const app = await NestFactory.create(AuthModule);
    const configService = app.get(ConfigService);
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../proto/auth.proto'),
        package: AUTH_PACKAGE_NAME,
        url: '0.0.0.0:50051',
      },
    })

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL')],
        queue: configService.get<string>('RABBITMQ_AUTH_QUEUE'),
        queueOptions: { durable: true },
        noAck: false,
        persistent: true,
      }
    })


    await app.startAllMicroservices();
    console.log('Auth microservice is running on port 50051 (Grpc client)');

  } catch (error) {
    console.error('Error starting the Auth microservice:', error);
  }
}
bootstrap();

