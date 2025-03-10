import { Controller } from '@nestjs/common';
import {
  CreateCustomProductRequest, CustomFilter, CustomProductListResponse,
  CustomProductsByUserRequest,
  CustomProductsController,
  CustomProductsControllerMethods,
  GetOne, StoresByUserRequest,
  UpdateCustomProductRequest,
} from '@app/common';
import { CustomProductsService } from './custom-products.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Product } from '../constants';


@Controller('custom-products')
@CustomProductsControllerMethods()
export class CustomProductController implements CustomProductsController{
  constructor(private readonly customProductsService: CustomProductsService ){}

  createCustomProduct(createCustomProductDto: CreateCustomProductRequest) {
    const {getUser, getProduct, createCustomProduct} = createCustomProductDto;
    return this.customProductsService.createCustomProduct(getUser, getProduct, createCustomProduct);
  }

  updateCustomProduct(updateCustomProductRequest: UpdateCustomProductRequest) {
    const {getOne, getUser,  updateCustomProduct } = updateCustomProductRequest;
    return this.customProductsService.updateCustomProduct (getOne, getUser, updateCustomProduct)
  }

  getCustomProductById(request: GetOne){
    return this.customProductsService.getCustomProduct(request)
  }

  getCustomProductsByUser(request: CustomProductsByUserRequest) {
    return this.customProductsService.getCustomProductByUser(request)
  }

  getProductsByStore(request: StoresByUserRequest) {
    return this.customProductsService.getCustomProductByStore(request)
  }

  getAllCustomProducts(request: CustomFilter) {
    return this.customProductsService.getAll(request)
  }

  //removing the customProduct from store (making isPublish= false)
  removeCustomProductFromStore(request: GetOne) {
    return this.customProductsService.unpublishCustomProduct(request)
  }

  deleteCustomProduct(request: GetOne) {
    return this.customProductsService.deleteCustomProduct(request)
  }

  @MessagePattern('get_custom_products')
  async getCustomProduct(@Payload() data: { id: string }, @Ctx() context: RmqContext  ): Promise<Product> {

    console.log('custom product id that is cut in the controller:', data);
    return  this.customProductsService.getSingleCustomProduct(data, context)
  }
}
