import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/products.entity';
import { Repository } from 'typeorm';
import { dateToTimestamp, GetOne, LoggerService, messages, ProductResponse } from '@app/common';
import { CreateProductDto, UpdateProductDto } from '@app/common/dtos';
import { catchError, from, map, Observable, pipe, switchMap } from 'rxjs';
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
    const {name, description, price} = createProductDto;
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
          if (updateProduct[key] !== undefined && updateProduct[key] !== product[key]) {
            updatedProduct[key] = updateProduct[key];
          }
        }

        if(Object.keys(updatedProduct).length>0){
          Object.assign(product, updatedProduct);
        }else {
          this.logger.log(`ProductRepo: No changes detected for product with ID "${id}".`);
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: 'No changes detected for product to update.'
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
}
