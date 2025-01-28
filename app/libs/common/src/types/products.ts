// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.0.3
//   protoc               v5.27.3
// source: proto/products.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Timestamp } from "google/protobuf/timestamp";

// export const protobufPackage = "products";

export interface GetOne {
  id: string;
}

export interface EmptyRequest {
}

export interface BaseProductsResponse {
  status: number;
  message: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  image: string[];
  template: string[];
}

export interface UpdateProduct {
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  image?: string[];
  template?: string[];
  isActive?: boolean | undefined;
}

export interface UpdateProductRequest {
  getOne: GetOne | undefined;
  updateProduct: UpdateProduct | undefined;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string[];
  template: string[];
  isActive: boolean;
  createdAt: Timestamp | undefined;
  updatedAt: Timestamp | undefined;
}

export interface ProductListResponse {
  products: ProductResponse[];
}

export interface CreateCustomProductRequest {
  productId: string;
  userId: string;
  design: string;
  placement: string;
  color: string;
  size: string;
  totalPrice: number;
}

export interface CustomProductsByUserRequest {
  userId: string;
}

export interface UpdateCustomProduct {
  design?: string | undefined;
  placement?: string | undefined;
  color?: string | undefined;
  size?: string | undefined;
  totalPrice?: number | undefined;
  isPublished?: boolean | undefined;
}

export interface UpdateCustomProductRequest {
  getOne: GetOne | undefined;
  updateCustomProduct: UpdateCustomProduct | undefined;
}

export interface CustomProductResponse {
  id: string;
  productId: string;
  userId: string;
  design: string;
  placement: string;
  color: string;
  size: string;
  totalPrice: number;
  isPublished: boolean;
  createdAt: Timestamp | undefined;
  updatedAt: Timestamp | undefined;
}

export interface CustomProductListResponse {
  customProducts: CustomProductResponse[];
}

export interface CreateStoreRequest {
  userId: string;
  storeName: string;
  storeDescription: string;
}

export interface StoresByUserRequest {
  userId: string;
}

export interface UpdateStore {
  storeName?: string | undefined;
  storeDescription?: string | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateStoreRequest {
  getOne: GetOne | undefined;
  updateStore: UpdateStore | undefined;
}

export interface StoreResponse {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  isActive: boolean;
  createdAt: Timestamp | undefined;
  updatedAt: Timestamp | undefined;
}

export interface StoreListResponse {
  stores: StoreResponse[];
}

export interface PublishCustomProductRequest {
  customProductId: string;
}

export const PRODUCTS_PACKAGE_NAME = "products";

/** Base Product Management */

export interface ProductServiceClient {
  getProducts(request: EmptyRequest): Observable<ProductListResponse>;

  getProductById(request: GetOne): Observable<ProductResponse>;

  createProduct(request: CreateProductRequest): Observable<ProductResponse>;

  updateProduct(request: UpdateProductRequest): Observable<ProductResponse>;

  deleteProduct(request: GetOne): Observable<BaseProductsResponse>;
}

/** Base Product Management */

export interface ProductServiceController {
  getProducts(
    request: EmptyRequest,
  ): Promise<ProductListResponse> | Observable<ProductListResponse> | ProductListResponse;

  getProductById(request: GetOne): Promise<ProductResponse> | Observable<ProductResponse> | ProductResponse;

  createProduct(
    request: CreateProductRequest,
  ): Promise<ProductResponse> | Observable<ProductResponse> | ProductResponse;

  updateProduct(
    request: UpdateProductRequest,
  ): Promise<ProductResponse> | Observable<ProductResponse> | ProductResponse;

  deleteProduct(
    request: GetOne,
  ): Promise<BaseProductsResponse> | Observable<BaseProductsResponse> | BaseProductsResponse;
}

export function ProductServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getProducts", "getProductById", "createProduct", "updateProduct", "deleteProduct"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ProductService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ProductService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const PRODUCT_SERVICE_NAME = "ProductService";

/** Custom Product Management */

export interface CustomProductsClient {
  createCustomProduct(request: CreateCustomProductRequest): Observable<CustomProductResponse>;

  getCustomProductById(request: GetOne): Observable<CustomProductResponse>;

  getCustomProductsByUser(request: CustomProductsByUserRequest): Observable<CustomProductListResponse>;

  getProductsByStore(request: StoresByUserRequest): Observable<CustomProductListResponse>;

  updateCustomProduct(request: UpdateCustomProductRequest): Observable<CustomProductResponse>;

  deleteCustomProduct(request: GetOne): Observable<BaseProductsResponse>;
}

/** Custom Product Management */

export interface CustomProductsController {
  createCustomProduct(
    request: CreateCustomProductRequest,
  ): Promise<CustomProductResponse> | Observable<CustomProductResponse> | CustomProductResponse;

  getCustomProductById(
    request: GetOne,
  ): Promise<CustomProductResponse> | Observable<CustomProductResponse> | CustomProductResponse;

  getCustomProductsByUser(
    request: CustomProductsByUserRequest,
  ): Promise<CustomProductListResponse> | Observable<CustomProductListResponse> | CustomProductListResponse;

  getProductsByStore(
    request: StoresByUserRequest,
  ): Promise<CustomProductListResponse> | Observable<CustomProductListResponse> | CustomProductListResponse;

  updateCustomProduct(
    request: UpdateCustomProductRequest,
  ): Promise<CustomProductResponse> | Observable<CustomProductResponse> | CustomProductResponse;

  deleteCustomProduct(
    request: GetOne,
  ): Promise<BaseProductsResponse> | Observable<BaseProductsResponse> | BaseProductsResponse;
}

export function CustomProductsControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "createCustomProduct",
      "getCustomProductById",
      "getCustomProductsByUser",
      "getProductsByStore",
      "updateCustomProduct",
      "deleteCustomProduct",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("CustomProducts", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("CustomProducts", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const CUSTOM_PRODUCTS_SERVICE_NAME = "CustomProducts";

/** Store Management */

export interface UserStoreClient {
  createStore(request: CreateStoreRequest): Observable<StoreResponse>;

  getStoreById(request: GetOne): Observable<StoreResponse>;

  getStoresByUser(request: StoresByUserRequest): Observable<StoreListResponse>;

  updateStore(request: UpdateStoreRequest): Observable<StoreResponse>;

  deleteStore(request: GetOne): Observable<BaseProductsResponse>;
}

/** Store Management */

export interface UserStoreController {
  createStore(request: CreateStoreRequest): Promise<StoreResponse> | Observable<StoreResponse> | StoreResponse;

  getStoreById(request: GetOne): Promise<StoreResponse> | Observable<StoreResponse> | StoreResponse;

  getStoresByUser(
    request: StoresByUserRequest,
  ): Promise<StoreListResponse> | Observable<StoreListResponse> | StoreListResponse;

  updateStore(request: UpdateStoreRequest): Promise<StoreResponse> | Observable<StoreResponse> | StoreResponse;

  deleteStore(request: GetOne): Promise<BaseProductsResponse> | Observable<BaseProductsResponse> | BaseProductsResponse;
}

export function UserStoreControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["createStore", "getStoreById", "getStoresByUser", "updateStore", "deleteStore"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UserStore", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UserStore", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USER_STORE_SERVICE_NAME = "UserStore";
