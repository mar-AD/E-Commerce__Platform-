import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomProductsEntity } from './entities/Custom_Products.entity';
import { Repository } from 'typeorm';
import { LoggerService, messages } from '@app/common';
import { CreateCustomProductDto } from '@app/common/dtos';
import { from, switchMap } from 'rxjs';
import { ProductEntity } from '../core-products/entities/products.entity';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class CustomProductsService {
  constructor(
    @InjectRepository(CustomProductsEntity) private readonly CustomProductRepository: Repository<CustomProductsEntity>,
    @InjectRepository(ProductEntity) private readonly ProductRepository: Repository<ProductEntity>,
    @Inject('RMQ_PRODUCTS_CLIENT') protected readonly clientProducts: ClientProxy,
    private readonly logger: LoggerService,
  ) {
  }

  createCustomProduct(createCustomProduct: CreateCustomProductDto) :Observable<CustomProductResponse> {
    const {productId, userId} = createCustomProduct;
    return from(this.ProductRepository.findOne({where: {id: productId}})).pipe(
      switchMap((product)=> {
        if (!product) {
          this.logger.log(`ProductRepo: entity with ID "${productId}" do not exist.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.FAILED_TO_FETCH_FOR_UPDATE
          })
        }
        return this.clientProducts.send<string>('get_user_id', {id: userId}).pipe(
          switchMap((response) =>{
            if(response !== true){
              throw new RpcException({
                code: status.NOT_FOUND,
                message: messages.USER.NOT_FOUND2
              });
            }
            return from(this.CustomProductRepository.save(product)).pipe(
              map((created)=>{
                return this.mappedResponse(created)
              })
            )
          })
        )
      }
    )
  }

  mappedResponse(product: CustomProductsEntity):CustomProductResponse {
    return {
      id = product.id,
      productId = product.product,
      userId = product.userId,
      design = product.design,
      placement = product.placement,
      color = product.color,
      size = product.size,
      totalPrice = product.totalPrice,
      isPublished = product.isPublished,
      createdAt = dateToTimestamp(product.createdAt),
      updatedAt = dateToTimestamp(product.updatedAt),
    }
  }

}
