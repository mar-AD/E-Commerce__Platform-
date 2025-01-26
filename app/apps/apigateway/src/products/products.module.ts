import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PRODUCTS_SERVICE } from '../constants';
import { PRODUCTS_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';

@Module({
  imports:[
    ClientsModule.register([{
      name: PRODUCTS_SERVICE,
      transport: Transport.GRPC,
      options: {
        package: PRODUCTS_PACKAGE_NAME,
        protoPath: join(__dirname, './proto/products.proto'),
        url: 'products:50057',
      }
    }])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
