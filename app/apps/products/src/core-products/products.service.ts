import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/products.entity';
import { Repository } from 'typeorm';
import {
  BaseProductsResponse,
  dateToTimestamp,
  GetOne,
  LoggerService,
  messages,
  ProductListResponse,
  ProductResponse,
} from '@app/common';
import { CreateProductDto, UpdateProductDto } from '@app/common/dtos';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity) private readonly productsRepository: Repository<ProductEntity>,
    private readonly logger: LoggerService,
  ) {
  }

  CreateProduct(createProductDto: CreateProductDto): Observable<ProductResponse> {
    const {name} = createProductDto;
    this.logger.log(`ProductRepo: Searching for entity by name "${name}" in repository...'`);
    return from(this.productsRepository.findOne({where: { name: name, isActive: true }})).pipe(
      switchMap(product => {
        if (product){
          this.logger.log(`ProductRepo: entity with name "${name}" already exists.`);
          throw new RpcException({
            code: status.ALREADY_EXISTS,
            message: messages.PRODUCTS.PRODUCT_ALREADY_EXISTS
          })
        }
        this.logger.log(`ProductRepo: Saving the new entity to the repository...`);
        return from(this.productsRepository.save(createProductDto)).pipe(
          map((newProduct)=>{
            this.logger.log(`ProductRepo: Entity successfully added`);
            return this.mappedResponse(newProduct) ;
          }),
          catchError((error)=>{
            this.logger.error(`productRepo: Failed to create and save the entity. Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: messages.PRODUCTS.FAILED_TO_ADD_PRODUCT,
            });
          })
        )
      })
    )
  }

  UpdateProduct(getOne: GetOne, updateProduct: UpdateProductDto): Observable<ProductResponse> {
    const{id} = getOne;
    this.logger.log(`ProductRepo: Searching for entity by ID "${id}" in repository...'`);
    return from(this.productsRepository.findOne({where: {id}})).pipe(
      switchMap((product)=>{
        if (!product) {
          this.logger.log(`ProductRepo: entity with ID "${id}" do not exist.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.FAILED_TO_FETCH_FOR_UPDATE
          })
        }
        const updatedProduct = {};
        for (const key of Object.keys(updateProduct)) {
          if (updateProduct[key] !== undefined) {

            if (Array.isArray(updateProduct[key]) && Array.isArray(product[key])) {
              if (!this.arraysAreEqual(updateProduct[key], product[key])) {
                updatedProduct[key] = updateProduct[key];
              }
            } else if (typeof updateProduct[key] === 'number' && typeof product[key] === 'string') {
              product[key] = parseFloat(product[key]);
              if (updateProduct[key] !== product[key]) {
                updatedProduct[key] = updateProduct[key];
              }

            } else if (updateProduct[key] !== product[key]) {
              updatedProduct[key] = updateProduct[key];
            }
          }
        }

        if (Object.keys(updatedProduct).length > 0) {
          Object.assign(product, updatedProduct);
        } else {
          this.logger.log(`ProductRepo: No changes detected for product with ID "${id}".`);
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: 'No changes detected for product to update.',
          });
        }

        this.logger.log(`ProductRepo: Saving the updated entity to the repository...`);
        return from(this.productsRepository.save(product)).pipe(
          map((saveProduct)=>{
            this.logger.log(`ProductRepo: Entity successfully updated`);
            return this.mappedResponse(saveProduct) ;
          }),
          catchError((error)=>{
            this.logger.error(`productRepo: Failed to save the updated entity. Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: messages.PRODUCTS.FAILED_TO_UPDATE_PRODUCT,
            });
          })
        )
      })

    )
  }

  GetAllProducts(): Observable<ProductListResponse>{
    this.logger.log(`ProductRepo: Searching for products ...`);
    return from(this.productsRepository.find({where: {isActive: true}})).pipe(
      map((products)=>{
        this.logger.log(`ProductRepo: products fetched successfully`);
        return { products: products.map(product => this.mappedResponse(product)) }
      }),
      catchError((error)=>{
        this.logger.error(`ProductRepo: Failed to fetch products. Error: ${error.message}`);
        throw new RpcException({
          code: status.INTERNAL,
          message: messages.PRODUCTS.FAILED_TO_FETCH_ALL_PRODUCTS
        })
      })
    )
  }

  GetProduct(getOne: GetOne): Observable<ProductResponse> {
    const{id} = getOne;
    this.logger.log(`ProductRepo: Searching for entity by ID "${id}" in repository...'`);
    return from(this.productsRepository.findOne({where: {id}})).pipe(
      map((product)=>{
        if (!product){
          this.logger.error(`ProductRepo: product with ID "${id}" not found'`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.PRODUCT_NOT_FOUND
          })
        }
        this.logger.log(`ProductRepo: product with ID "${id}" found successfully `);
        return this.mappedResponse(product)
      }),
      catchError((error)=>{
        this.logger.error(`ProductRepo: Failed to fetch product with ID "${id}". Error: ${error.message}`);
        throw new RpcException({
          code: status.INTERNAL,
          message: messages.PRODUCTS.FAILED_TO_FETCH_PRODUCT
        })
      })
    )
  }

  DeleteProduct(getOne: GetOne) : Observable<BaseProductsResponse> {
    const{id} = getOne;
    return from(this.productsRepository.delete({id})).pipe(
      map((result)=>{
        if (result.affected === 0) {
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.PRODUCT_NOT_FOUND,
          });
        }
        this.logger.log(`ProductRepo: product with ID "${id}" deleted successfully `);
        return {
          status: HttpStatus.OK,
          message: messages.PRODUCTS.PRODUCT_DELETED_SUCCESSFULLY
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

  mappedResponse(product: ProductEntity): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      template: product.template,
      isActive: product.isActive,
      createdAt: dateToTimestamp(product.createdAt),
      updatedAt: dateToTimestamp(product.updatedAt),
    }
  }

  private arraysAreEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => item === arr2[index]);
  }

}
