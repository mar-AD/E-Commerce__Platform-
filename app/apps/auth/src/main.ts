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

    const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
      AuthModule,
      {
        transport: Transport.GRPC,
        options: {
          protoPath: join(__dirname, '../proto/auth.proto'),
          package: AUTH_PACKAGE_NAME,
          url: '0.0.0.0:50051',
        },
      },
    );

    await grpcApp.listen();
    console.log('Auth microservice is running on port 50051 (Grpc client)');

    const rabbitClient = app.connectMicroservice<MicroserviceOptions>(
      {
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('RABBITMQ_URL')],
          queue:configService.get<string>('RABBITMQ_EMAIL_QUEUE'),
          queueOptions: {
            durable: true,
          },
        }
      }
    )

    await rabbitClient.listen()
    console.log('Auth microservice is running on port 50051 (rabbit client)');

  } catch (error) {
    console.error('Error starting the Auth microservice:', error);
  }
}
bootstrap();

