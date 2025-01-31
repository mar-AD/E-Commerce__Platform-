import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomProductsEntity } from './entities/Custom_Products.entity';
import { Repository } from 'typeorm';
import {
  BaseProductsResponse, CustomProductListResponse,
  CustomProductResponse, CustomProductsByUserRequest,
  dateToTimestamp,
  GetOne,
  LoggerService,
  messages,
} from '@app/common';
import { CreateCustomProductDto, UpdateCustomProductDto } from '@app/common/dtos';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
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
    this.logger.log(`ProductRepo: Searching for entity by ID "${productId}" in repository...'`);
    return from(this.ProductRepository.findOne({where: {id: productId}})).pipe(
      switchMap((product)=> {
        if (!product) {
          this.logger.log(`ProductRepo: entity with ID "${productId}" do not exist.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.PRODUCT_NOT_FOUND
          })
        }
        this.logger.log(`CustomProducts: sending get_user_id message... '`);
        return this.clientProducts.send<boolean>('get_user_id', {id: userId}).pipe(
          switchMap((userExists) =>{
            if(!userExists){
              this.logger.log(`UserRepo: entity with ID "${userId}" do not exist.`);
              throw new RpcException({
                code: status.NOT_FOUND,
                message: messages.USER.NOT_FOUND2
              });
            }
            this.logger.log(`CustomProductRepo: entity with ID "${productId}" created successfully .`);
            return from(this.CustomProductRepository.save(product)).pipe(
              map((created)=>{
                return this.mappedResponse(created)
              })
            )
          })
        )
      })
    )
  }

  updateCustomProduct(getOne: GetOne, updateCustomProduct: UpdateCustomProductDto) :Observable<CustomProductResponse> {
    const{ id} = getOne;
    const{  } = updateCustomProduct;
    this.logger.log(`CustomProductRepo: Searching for entity by ID "${id}" in repository...'`);
    return from(this.CustomProductRepository.findOne({where: {id}})).pipe(
      switchMap((product) =>{
        if (!product){
          this.logger.log(`CustomProductRepo: entity with ID "${id}" do not exist.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.CUSTOM_PRODUCT_NOT_FOUND
          })
        }
        const updatedCustomProduct = {};
        this.logger.log(`CustomProductRepo: created a loop to loop over the updateCustomProduct keys.`);
        for (const key of Object.keys(updateCustomProduct)) {
          if (updateCustomProduct[key] !== undefined){
            if (typeof updateCustomProduct[key] === 'object' && typeof product[key] === 'object'){

              if (!this.isEqual(updateCustomProduct[key], product[key])){
                this.logger.log(`CustomProductRepo: the object key in the CustomProduct was updated successfully .`);
                updatedCustomProduct[key] = updateCustomProduct[key]
              }
            }
            // else if(typeof updateCustomProduct[key] === 'number' && typeof product[key] === 'string'){
            //   product[key] = parseFloat(product[key]);
            //   if (updatedCustomProduct[key] !== product[key]){
            //    this.logger.log(`CustomProductRepo: the number key in the CustomProduct was updated successfully .`);
            //     updatedCustomProduct[key] = updateCustomProduct[key]
            //   }
            // }
            else if (updatedCustomProduct[key] !== product[key]){
              this.logger.log(`CustomProductRepo: every other key was updated successfully .`);
              updatedCustomProduct[key] = updateCustomProduct[key]
            }
          }
        }

        if (Object.keys(updatedCustomProduct).length > 0){
          this.logger.log(`CustomProductRepo: changes detected in updatedCustomProduct and it was updated successfully in the product entity .`);
          Object.assign(product, updatedCustomProduct)
        }
        else {
          this.logger.log(`CustomProductRepo: No changes detected for customProduct with ID "${id}".`);
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: 'No changes detected for customProduct to update.',
          });
        }
        return from(this.CustomProductRepository.save(product)).pipe(
          map((saveProduct)=>{
            this.logger.log(`CustomProductRepo: Entity successfully updated`);
            return this.mappedResponse(saveProduct) ;
          }),
          catchError((error)=>{
            this.logger.error(`CustomProductRepo: Failed to save the updated entity. Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: messages.PRODUCTS.FAILED_TO_UPDATE_CUSTOM_PRODUCT,
            });
          })
        )
      })
    )
  }

  getCustomProduct(getOne: GetOne): Observable<CustomProductResponse> {
    const{id} = getOne;
    this.logger.log(`CustomProducts: Searching for entity by ID "${id}" in repository...'`);
    return from(this.CustomProductRepository.findOne({where: {id}})).pipe(
      map((product)=>{
        if (!product){
          this.logger.error(`CustomProducts: custom product with ID "${id}" not found'`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.CUSTOM_PRODUCT_NOT_FOUND
          })
        }
        this.logger.log(`CustomProducts:custom product with ID "${id}" found successfully `);
        return this.mappedResponse(product)
      }),
      catchError((error)=>{
        this.logger.error(`CustomProducts: Failed to fetch custom product with ID "${id}". Error: ${error.message}`);
        throw new RpcException({
          code: status.INTERNAL,
          message: messages.PRODUCTS.FAILED_TO_FETCH_CUSTOM_PRODUCT
        })
      })
    )
  }

  getCustomProductByUser(request: CustomProductsByUserRequest): Observable<CustomProductListResponse> {
    const{userId} = request;
    this.logger.log(`CustomProducts: sending get_user_id message... '`);
    return this.clientProducts.send<boolean>('get_user_id', {id: userId}).pipe(
      switchMap((userExists) => {
        if (!userExists) {
          this.logger.log(`UserRepo: entity with ID "${userId}" do not exist.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.USER.NOT_FOUND2
          });
        }
        this.logger.log(`CustomProducts: Searching for entity by ID "${userId}" in repository...'`);
        return from(this.CustomProductRepository.find({ where: { userId } })).pipe(
          map((products) => {
            if (!products) {
              this.logger.error(`CustomProducts: custom product with ID "${userId}" not found'`);
              throw new RpcException({
                code: status.NOT_FOUND,
                message: messages.PRODUCTS.CUSTOM_PRODUCT_NOT_FOUND
              })
            }
            this.logger.log(`CustomProducts:custom product with ID "${userId}" found successfully `);
            return { customProducts: products.map((product) => this.mappedResponse(product))}
          }),
          catchError((error) => {
            this.logger.error(`CustomProducts: Failed to fetch custom product with ID "${userId}". Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: messages.PRODUCTS.FAILED_TO_FETCH_CUSTOM_PRODUCT
            })
          })
        )
      })
    )
  }

  getCustomProductByStore(request: CustomProductsByUserRequest): Observable<CustomProductListResponse> {
    const{userId} = request;
    this.logger.log(`CustomProducts: sending get_user_id message... '`);
    return this.clientProducts.send<boolean>('get_user_id', {id: userId}).pipe(
      switchMap((userExists) => {
        if (!userExists) {
          this.logger.log(`UserRepo: entity with ID "${userId}" do not exist.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.USER.NOT_FOUND2
          });
        }
        this.logger.log(`CustomProducts: Searching for entity by ID "${userId}" in repository...'`);
        return from(this.CustomProductRepository.find({ where: { userId: userId, isPublished: true } })).pipe(
          map((products) => {
            if (!products) {
              this.logger.error(`CustomProducts: custom product with ID "${userId}" not found'`);
              throw new RpcException({
                code: status.NOT_FOUND,
                message: messages.PRODUCTS.CUSTOM_PRODUCT_NOT_FOUND
              })
            }
            this.logger.log(`CustomProducts:custom product with ID "${userId}" found successfully `);
            return { customProducts: products.map((product) => this.mappedResponse(product))}
          }),
          catchError((error) => {
            this.logger.error(`CustomProducts: Failed to fetch custom product with ID "${userId}". Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: messages.PRODUCTS.FAILED_TO_FETCH_CUSTOM_PRODUCT
            })
          })
        )
      })
    )
  }

  //removing the cutomProduct from store (making isPublish= false)

  //for the user to delete the custom product from his profile
  deleteCustomProduct(getOne: GetOne) : Observable<BaseProductsResponse> {
    const{id} = getOne;
    return from(this.CustomProductRepository.delete({id})).pipe(
      map((result)=>{
        if (result.affected === 0) {
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.CUSTOM_PRODUCT_NOT_FOUND,
          });
        }
        this.logger.log(`ProductRepo: product with ID "${id}" deleted successfully `);
        return {
          status: HttpStatus.OK,
          message: messages.PRODUCTS.CUSTOM_PRODUCT_DELETED_SUCCESSFULLY
        }
      }),
      catchError((error)=>{
        this.logger.error(`ProductRepo: failed to delete product with ID "${id}". Error: ${error.message}`);
        throw new RpcException({
          code: status.INTERNAL,
          message: messages.PRODUCTS.FAILED_TO_DELETE_PRODUCT
        })
      })
    )
  }

  private isEqual (obj1: any, obj2: any): boolean {
    if (obj1 === obj2 ) return true;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if ( keys1.length !== keys2.length) return false;
    for(let key of keys1){
      if (!keys2.includes(key)) return false;
      if (!this.isEqual(obj1[key], obj2[key])) return false;
    }
    return true;
  }

  mappedResponse(product: CustomProductsEntity):CustomProductResponse {
    return {
      id : product.id,
      productId : product.product.id,
      userId : product.userId,
      design : product.design,
      placement : product.placement?? {},
      color : product.color,
      size : product.size,
      totalPrice : product.totalPrice,
      isPublished : product.isPublished,
      createdAt : dateToTimestamp(product.createdAt),
      updatedAt : dateToTimestamp(product.updatedAt),
    }
  }

}
