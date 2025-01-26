import { Controller } from '@nestjs/common';
import {
  GetOne,
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

  getProducts() {
    return this.productService.GetAllProducts()
  }

  getProductById(request: GetOne){
    return this.productService.GetProduct(request)
  }

  deleteProduct(request: GetOne) {
    return this.productService.DeleteProduct(request)
  }

}
