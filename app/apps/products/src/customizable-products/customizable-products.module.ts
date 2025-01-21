import { Module } from '@nestjs/common';
import { CustomizableProductsController } from './customizable-products.controller';
import { CustomizableProductsService } from './customizable-products.service';

@Module({
  controllers: [CustomizableProductsController],
  providers: [CustomizableProductsService]
})
export class CustomizableProductsModule {}
