import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateCustomProductRequest,
  CUSTOM_PRODUCTS_SERVICE_NAME, CustomFilter, CustomProductsByUserRequest,
  CustomProductsClient, Filter,
  GetOne, StoresByUserRequest, UpdateCustomProductRequest,
} from '@app/common';
import { PRODUCTS_SERVICE } from '../../constants';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class CustomProductsService implements OnModuleInit{
  private customProductService: CustomProductsClient
  constructor(@Inject(PRODUCTS_SERVICE) private client: ClientGrpc){}

  onModuleInit() {
    this.customProductService= this.client.getService<CustomProductsClient>(CUSTOM_PRODUCTS_SERVICE_NAME);
  }

  create(createCustomProductDto: CreateCustomProductRequest){
    return this.customProductService.createCustomProduct(createCustomProductDto)
  }

  update(updateCustomProductRequest: UpdateCustomProductRequest){
    return this.customProductService.updateCustomProduct(updateCustomProductRequest)
  }

  getOneCustomProduct(request: GetOne){
    return this.customProductService.getCustomProductById(request)
  }

  getCustomProductsByUser(customProductsByUserRequest : CustomProductsByUserRequest){
    return this.customProductService.getCustomProductsByUser(customProductsByUserRequest)
  }

  getCustomProductsByStore(storesByUserRequest : StoresByUserRequest){
    return this.customProductService.getProductsByStore(storesByUserRequest)
  }

  getAll(request: CustomFilter) {
    return this.customProductService.getAllCustomProducts(request)
  }

  unpublish(request: GetOne){
    return this.customProductService.removeCustomProductFromStore(request)
  }

  removeCustomProduct(request: GetOne){
    return this.customProductService.deleteCustomProduct(request)
  }
}
