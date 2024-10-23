import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH_PACKAGE_NAME } from '@app/common';

async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
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
    await app.listen();
    console.log('Auth microservice is running on port 50051');
  } catch (error) {
    console.error('Error starting the Auth microservice:', error);
  }
}
bootstrap();

