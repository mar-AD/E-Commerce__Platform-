import { Controller } from '@nestjs/common';
import {
  LoggerService,
  ProductServiceController,
  ProductServiceControllerMethods,
  UpdateProductRequest,
} from '@app/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from '@app/common/dtos';

@Controller()
@ProductServiceControllerMethods()
export class ProductsController implements ProductServiceController{
  constructor(
    private readonly productService: ProductsService,
    private logger: LoggerService,
  ) {}

  createProduct(createProductDto: CreateProductDto) {
    return this.productService.CreateProduct(createProductDto)
  }

  updateProduct(updateProductRequest: UpdateProductRequest) {
    const { getOne, updateProduct} = updateProductRequest;
    return this.productService.UpdateProduct(getOne, updateProduct)
  }

}
