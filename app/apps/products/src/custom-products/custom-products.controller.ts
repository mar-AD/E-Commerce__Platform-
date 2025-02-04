import { Controller } from '@nestjs/common';
import {
  CreateCustomProductRequest,
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

  //removing the customProduct from store (making isPublish= false)
  removeCustomProductFromStore(request: GetOne) {
    return this.customProductsService.unpublishCustomProduct(request)
  }

  deleteCustomProduct(request: GetOne) {
    return this.customProductsService.deleteCustomProduct(request)
  }
}
