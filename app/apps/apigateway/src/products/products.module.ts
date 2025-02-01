import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, PRODUCTS_SERVICE } from '../constants';
import { AUTH_PACKAGE_NAME, PRODUCTS_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { CustomProductsService } from './services/custom-products.service';
import { CustomProductsController } from './controllers/custom-products.controller';

@Module({
  imports:[
    ClientsModule.register([{
      name: PRODUCTS_SERVICE,
      transport: Transport.GRPC,
      options: {
        package: PRODUCTS_PACKAGE_NAME,
        protoPath: join(__dirname, '../proto/products.proto'),
        url: 'products:50057',
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
    },
    ])
  ],
  controllers: [ProductsController, CustomProductsController],
  providers: [ProductsService, CustomProductsService],
})
export class ProductsModule {}
