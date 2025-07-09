import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { join } from 'path';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME, PRODUCTS_PACKAGE_NAME } from '@app/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(ProductsModule)
    const configService = app.get(ConfigService);
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../proto/products.proto'),
        package: PRODUCTS_PACKAGE_NAME,
        url: '0.0.0.0:50057',
      },
    })

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL')],
        queue: configService.get<string>('RABBITMQ_PRODUCTS_QUEUE'),
        queueOptions: { durable: true },
        noAck: false,
        persistent: true,
      }
    })

    await app.startAllMicroservices();
    console.log('products microservice is running on port 50057');

  } catch (error) {
    console.error('Error starting the products microservice:', error);
  }

}
bootstrap();
