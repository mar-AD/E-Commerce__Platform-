import { Module } from '@nestjs/common';
import { MainProductsController } from './main-products.controller';

@Module({
  controllers: [MainProductsController]
})
export class MainProductsModule {}
