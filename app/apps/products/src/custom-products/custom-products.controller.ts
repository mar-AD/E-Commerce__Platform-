import { Controller } from '@nestjs/common';
import {
  CustomProductsByUserRequest,
  CustomProductsController,
  CustomProductsControllerMethods,
  GetOne, StoresByUserRequest,
  UpdateCustomProductRequest,
} from '@app/common';
import { CustomProductsService } from './custom-products.service';
import { CreateCustomProductDto } from '@app/common/dtos';


@Controller('custom-products')
@CustomProductsControllerMethods()
export class CustomProductController implements CustomProductsController{
  constructor(private readonly customProductsService: CustomProductsService ){}

  createCustomProduct(createCustomProduct: CreateCustomProductDto) {
    return this.customProductsService.createCustomProduct(createCustomProduct);
  }

  updateCustomProduct(updateCustomProductRequest: UpdateCustomProductRequest) {
    const {getOne, updateCustomProduct } = updateCustomProductRequest;
    return this.customProductsService.updateCustomProduct (getOne, updateCustomProduct)
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

  //removing the cutomProduct from store (making isPublish= false)


  deleteCustomProduct(request: GetOne) {
    return this.customProductsService.deleteCustomProduct(request)
  }
}
