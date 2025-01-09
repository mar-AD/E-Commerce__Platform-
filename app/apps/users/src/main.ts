import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { USERS_PACKAGE_NAME } from '@app/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {

  try {
    const app = await NestFactory.create(UsersModule);
    const configService = app.get(ConfigService);

    const rabbitMqMicroservice = app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL')],
        queue: configService.get<string>('RABBITMQ_USERS_QUEUE'),
        queueOptions: { durable: true },
        noAck: false, // Ensures messages are acknowledged only after successful processing
        persistent: true,
      },
    });

    // Start RabbitMQ Microservice
    // await app.startAllMicroservices();

    const grpcMicroservice  = await NestFactory.createMicroservice<MicroserviceOptions>(
      UsersModule,
      {
        transport: Transport.GRPC,
        options: {
          protoPath: join(__dirname, '../proto/users.proto'),
          package: USERS_PACKAGE_NAME,
          url: '0.0.0.0:50053',
        }
      }
    )
    await app.startAllMicroservices();
    // console.log('Users microservice is running on port 50053 (Grpc client)');
    console.log('Users microservices are running (grpc, rmq)');
  }catch (err){
    console.log('Error starting the users microservice:', err)
  }
}
bootstrap();
