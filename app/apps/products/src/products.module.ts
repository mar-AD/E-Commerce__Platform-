import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MainProductsService } from './main-products/main-products.service';
import { MainProductsModule } from './main-products/main-products.module';
import { MainProductsController } from './main-products/main-products.controller';
import { CustomizableProductsController } from './customizable-products/customizable-products.controller';
import { CustomizableProductsService } from './customizable-products/customizable-products.service';
import { CustomizableProductsModule } from './customizable-products/customizable-products.module';

@Module({
  imports: [MainProductsModule, CustomizableProductsModule],
  controllers: [MainProductsController, CustomizableProductsController],
  providers: [ProductsService, MainProductsService, CustomizableProductsService],
})
export class ProductsModule {}
