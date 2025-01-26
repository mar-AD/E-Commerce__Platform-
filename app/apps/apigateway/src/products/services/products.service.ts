import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { EmptyRequest, GetOne, PRODUCT_SERVICE_NAME, ProductServiceClient, UpdateProductRequest } from '@app/common';
import { PRODUCTS_SERVICE } from '../../constants';
import { ClientGrpc } from '@nestjs/microservices';
import { CreateProductDto } from '@app/common/dtos';

@Injectable()
export class ProductsService implements OnModuleInit{
  private productService: ProductServiceClient
  constructor(@Inject(PRODUCTS_SERVICE) private client: ClientGrpc){}

  onModuleInit() {
    this.productService= this.client.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  CreateProduct(createProductDto: CreateProductDto){
    return this.productService.createProduct(createProductDto)
  }

  UpdateProduct(updateProductRequest: UpdateProductRequest){
    return this.productService.updateProduct(updateProductRequest)
  }

  getOneProduct(request: GetOne){
    return this.productService.getProductById(request)
  }

  getAllProducts(request: EmptyRequest){
    return this.productService.getProducts(request)
  }

  DeleteProduct(request: GetOne){
    return this.productService.deleteProduct(request)
  }
}
