import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products.module';
import { join } from 'path';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PRODUCTS_PACKAGE_NAME } from '@app/common';

async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      ProductsModule,
      {
        transport: Transport.GRPC,
        options: {
          protoPath: join(__dirname, '../proto/products.proto'),
          package: PRODUCTS_PACKAGE_NAME,
          url: '0.0.0.0:50057',
        }
      }
    );
    await app.listen();
    console.log('products microservice is running on port 50057 (Grpc client)');

  } catch (error) {
    console.error('Error starting the products microservice:', error);
  }

}
bootstrap();
