import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MainProductsService } from './main-products/main-products.service';
import { MainProductsController } from './main-products/main-products.controller';
import { CustomizableProductsController } from './customizable-products/customizable-products.controller';
import { CustomizableProductsService } from './customizable-products/customizable-products.service';

@Module({
  imports: [],
  controllers: [MainProductsController, CustomizableProductsController],
  providers: [ProductsService, MainProductsService, CustomizableProductsService],
})
export class ProductsModule {}
