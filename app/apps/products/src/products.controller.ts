import { Controller } from '@nestjs/common';
import { LoggerService, ProductServiceControllerMethods } from '@app/common';
import { ProductsService } from './products.service';

@Controller()
@ProductServiceControllerMethods()
export class ProductsController {
  constructor(
    private readonly productService: ProductsService,
    private logger: LoggerService,
  ) {}
}
