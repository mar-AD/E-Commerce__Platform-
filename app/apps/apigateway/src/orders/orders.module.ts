import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, ORDERS_SERVICE } from '../constants';
import { AUTH_PACKAGE_NAME, ORDERS_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    ClientsModule.register([{
      name: ORDERS_SERVICE,
      transport: Transport.GRPC,
      options: {
        package: ORDERS_PACKAGE_NAME,
        protoPath: join(__dirname, '../proto/orders.proto'),
        url: 'orders:50059',
      }
    },
    {
      name: AUTH_SERVICE,
      transport: Transport.GRPC,
      options: {
        package: AUTH_PACKAGE_NAME,
        protoPath: join(__dirname, '../proto/auth.proto'),
        url: 'auth:50051',
      },
    }
    ])
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
