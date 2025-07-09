import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ORDERS_PACKAGE_NAME } from '@app/common';

async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      OrdersModule,
      {
        transport: Transport.GRPC,
        options:{
          protoPath: join(__dirname, '../proto/orders.proto'),
          package: ORDERS_PACKAGE_NAME,
          url: '0.0.0.0:50059',
        }
      }
    );
    await app.listen();
    console.log('orders microservices is running successfully.');
  }
  catch (err){
    console.error('Error starting the orders microservice:', err);
  }
}
bootstrap();
