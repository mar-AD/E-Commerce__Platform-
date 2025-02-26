import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomProductsEntity } from './entities/Custom_Products.entity';
import { Repository } from 'typeorm';
import {
  BaseProductsResponse, CustomFilter, CustomProductListResponse,
  CustomProductResponse, CustomProductsByUserRequest,
  dateToTimestamp, EmptyRequest,
  GetOne, GetProductId,
  LoggerService,
  messages, StoresByUserRequest,
} from '@app/common';
import { CreateCustomProductDto, UpdateCustomProductDto } from '@app/common/dtos';
import { catchError, from, map, Observable, switchMap, tap } from 'rxjs';
import { ProductEntity } from '../core-products/entities/products.entity';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class CustomProductsService {
  constructor(
    @InjectRepository(CustomProductsEntity) private readonly CustomProductRepository: Repository<CustomProductsEntity>,
    @InjectRepository(ProductEntity) private readonly ProductRepository: Repository<ProductEntity>,
    @Inject('RMQ_AUTH_CLIENT') protected readonly clientAuth: ClientProxy,
    private readonly logger: LoggerService,
  ) {
  }

  createCustomProduct(
    getUser: CustomProductsByUserRequest,
    getProduct: GetProductId,
    createCustomProduct: CreateCustomProductDto,

  ): Observable<CustomProductResponse> {
    const { productId } = getProduct;
    const { userId } = getUser;

    this.logger.debug(`Searching for product ID: "${productId}"`);

    return from(this.ProductRepository.findOne({ where: { id: productId } })).pipe(
      switchMap(product => {
        if (!product) {
          this.logger.warn(`Product with ID "${productId}" not found.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.PRODUCT_NOT_FOUND
          });
        }
        this.logger.debug(`Sending get_user_id message for user "${userId}"`);
        return this.clientAuth.send<boolean>('get_user_id', { id: userId }).pipe(
          tap(userExists => {
            if (!userExists) {
              this.logger.warn(`User with ID "${userId}" not found.`);
              throw new RpcException({
                code: status.NOT_FOUND,
                message: messages.USER.NOT_FOUND2
              });
            }
          }),
          switchMap(() => {
            const newCreateCustomProduct = { product, userId, ...createCustomProduct };
            this.logger.log(`Creating custom product for User ID: "${userId}" and Product ID: "${productId}"`);
            return from(this.CustomProductRepository.save(newCreateCustomProduct)).pipe(
              map(created => this.mappedResponse(created)),
              catchError(err => {
                this.logger.error(`Failed to create custom product: ${err.message}`);
                throw new RpcException({
                  code: status.INTERNAL,
                  message: messages.PRODUCTS.FAILED_TO_CREATE_CUSTOM_PRODUCT
                });
              })
            )
          }),
        );
      }),
    );
  }


  updateCustomProduct(getOne: GetOne, getUser: CustomProductsByUserRequest, updateCustomProduct: UpdateCustomProductDto) :Observable<CustomProductResponse> {
    const{ id} = getOne;
    const { userId } = getUser
    this.logger.log(`CustomProductRepo: Searching for entity by ID "${id}" in repository...'`);
    return from(this.CustomProductRepository.findOne({where: {id: id, userId: userId}, relations: ['product']})).pipe(
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

        this.logger.log(`CustomProductRepo: created a loop to loop over the updateCustomProduct keys.`);
        for (const key of Object.keys(updateCustomProduct)) {
          if (updateCustomProduct[key] !== undefined) {
            if (typeof updateCustomProduct[key] === 'object' && typeof product[key] === 'object') {
              if (!this.isEqual(updateCustomProduct[key], product[key])) {
                this.logger.log(`CustomProductRepo: the object key in the CustomProduct was updated successfully.`);
                updatedCustomProduct[key] = updateCustomProduct[key];
              }
            }
            else if(typeof updateCustomProduct[key] === 'number' && typeof product[key] === 'string'){
              product[key] = parseFloat(product[key]);
              if (updateCustomProduct[key] !== product[key]){
               this.logger.log(`CustomProductRepo: the number key in the CustomProduct was updated successfully .`);
                updatedCustomProduct[key] = updateCustomProduct[key]
              }
            }
            // Ensure we compare values correctly and avoid unnecessary updates
            else if (JSON.stringify(updateCustomProduct[key]) !== JSON.stringify(product[key])) {
              this.logger.log(`CustomProductRepo: every other key was updated successfully.`);
              updatedCustomProduct[key] = updateCustomProduct[key];
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
        return from( this.CustomProductRepository.save(product)).pipe(
          map((saveProduct)=>{
            this.logger.log(`CustomProductRepo: Entity successfully updated: ${JSON.stringify(saveProduct, null, 2)}`);
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
    return from(this.CustomProductRepository.findOne({where: {id}, relations: ['product']})).pipe(
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
    return this.clientAuth.send<boolean>('get_user_id', {id: userId}).pipe(
      switchMap((userExists) => {
        if (!userExists) {
          this.logger.log(`UserRepo: entity with ID "${userId}" do not exist.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.USER.NOT_FOUND2
          });
        }
        this.logger.log(`CustomProducts: Searching for entity by ID "${userId}" in repository...'`);
        return from(this.CustomProductRepository.find({ where: { userId }, relations: ['product'] })).pipe(
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

  getCustomProductByStore(request: StoresByUserRequest): Observable<CustomProductListResponse> {
    const{userId} = request;
    this.logger.log(`CustomProducts: sending get_user_id message... '`);
    return this.clientAuth.send<boolean>('get_user_id', {id: userId}).pipe(
      switchMap((userExists) => {
        if (!userExists) {
          this.logger.log(`UserRepo: entity with ID "${userId}" do not exist.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.USER.NOT_FOUND2
          });
        }
        this.logger.log(`CustomProducts: Searching for entity by ID "${userId}" in repository...'`);
        return from(this.CustomProductRepository.find({ where: { userId: userId, isPublished: true }, relations: ['product'] })).pipe(
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

  getAll(request: CustomFilter): Observable<CustomProductListResponse> {
    const filter = request.isPublished !== undefined ? { isPublished: request.isPublished } : {};

    this.logger.log(`Fetching custom products with filter: ${JSON.stringify(filter)}`);

    return from(this.CustomProductRepository.find({ where: filter, relations: ['product'] })).pipe(
      map((customProducts) => {
        this.logger.log(`Successfully fetched ${customProducts.length} custom products`);
        console.log(customProducts);
        return { customProducts: customProducts.map((customProduct) => this.mappedResponse(customProduct)) };
      }),
      catchError((err) => {
        this.logger.error(`'Failed to fetch custom products'. Error: ${err.message}`);

        throw new RpcException({
          code: status.INTERNAL,
          message: messages.PRODUCTS.FAILED_TO_FETCH_CUSTOM_PRODUCTS
        });
      })
    );
  }


  //removing the customProduct from store (making isPublish= false)
  unpublishCustomProduct(request: GetOne) : Observable<BaseProductsResponse> {
    const{id} = request;
    this.logger.log(`CustomProducts: Searching for entity by ID "${id}" in repository...'`);
    return from(this.CustomProductRepository.findOne({where: {id}})).pipe(
      switchMap((product)=>{
        if (!product){
          this.logger.error(`CustomProducts: custom product with ID "${id}" not found'`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.CUSTOM_PRODUCT_NOT_FOUND
          })
        }
        this.logger.log(`CustomProducts:custom product with ID "${id}" found successfully `);
        this.logger.log(`CustomProducts: now pursuing to update the entity by ID "${id}"`);
        if (product.isPublished === false){
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: 'this custom product is already not published'
          })
        }
        product.isPublished = false;
        return from(this.CustomProductRepository.save(product)).pipe(
          map(() =>{
            this.logger.log(`CustomProducts: custom product with ID "${id}" unpublished successfully `);
            return{
              status: HttpStatus.OK,
              message: 'The custom Product unpublished successfully',
            }
          }),
          catchError((error)=>{
            this.logger.error(`CustomProducts: Failed to unpublish custom product with ID "${id}". Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: 'Failed to unpublish custom product'
            })
          })
        )
      })
    )
  }

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
      product : product.product.id,
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
