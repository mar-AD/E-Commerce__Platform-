import * as bcrypt from 'bcrypt'
import { catchError, from, Observable, switchMap } from 'rxjs';
import { messages } from '@app/common/utils/messages';
import { RpcException } from '@nestjs/microservices';
import {status} from '@grpc/grpc-js';
import { PlacementDetail } from '@app/common/types';
import { dateToTimestamp } from '@app/common/utils/timestamp-converter';
import { Timestamp } from 'google/protobuf/timestamp';

//this for hashing password
export const hashPassword = (password: string):Observable<string> => {
  return from(bcrypt.genSalt(10)).pipe(
    switchMap((salt)=>
      from(bcrypt.hash(password, salt)).pipe(
        catchError((err)=>{
          throw new RpcException({
            code: err.status || status.INTERNAL,
            message: err.response || messages.PASSWORD.FAILED_TO_HASH_PASSWORD
          })
        })
      )
    )
  )
}

//compare password
export const verifyPassword = (password: string, currentPass: string):Observable<boolean> => {
  return from(bcrypt.compare(password, currentPass))
}

//set the expiration date (refreshToken / email code ...)
export const getExpiryDate = (days: number = 0, hours: number = 0, minutes:number = 0): Date =>{
  const date = new Date()
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes)
  return date
}

//generate update email code
export const generateEmailCode = () => {
  let code = '';
  for (let i=0; i <= 6; i++){
    const randomDigits = Math.floor(Math.random()*10)
    code += randomDigits
  }
  return code;
}

//verify the email code
export const VerifyEmailCode = (expired: Date)=>{
  let currentDate = new Date()
  if(currentDate > expired){
    throw new RpcException({
      code: status.NOT_FOUND,
      message: 'Verification code has expired.',
    });
  }
}

export enum PermissionsNames {
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ORDERS = 'MANAGE_ORDERS',
  MANAGE_PRODUCTS = 'MANAGE_PRODUCTS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_ADMINS = 'MANAGE_ADMINS',
}


//for getting the roles string name instead of the value (numbers)
export const PermissionsName = {
  0: 'PERMISSION_UNSPECIFIED',
  1: 'VIEW_DASHBOARD',
  2: 'MANAGE_USERS',
  3: 'MANAGE_ORDERS',
  4: 'MANAGE_PRODUCTS',
  5: 'MANAGE_ROLES',
  6: 'MANAGE_ADMINS',
  '-1': 'UNRECOGNIZED',
} as const;

export function getPermissionName(value: number): string | undefined {
  return PermissionsName[value] ?? undefined;
}

//for customProducts entity and dtos
export type Placement = Record<string, PlacementDetail>;

//for delivery date
export function getDeliveryDate(shippingMethod: DeliveryType): Timestamp {
  const today = new Date();
  let deliveryDays = 0;

  switch (shippingMethod.toLowerCase()) {
    case "STANDARD":
      deliveryDays = Math.floor(Math.random() * (5 - 3 + 1)) + 3; // 3-5 days
      break;
    case "EXPRESS":
      deliveryDays = Math.floor(Math.random() * (2 - 1 + 1)) + 1; // 1-2 days
      break;
    default:
      deliveryDays = 5;
  }

  today.setDate(today.getDate() + deliveryDays);
  return dateToTimestamp(today)
}

//for order deliveryType
export enum DeliveryType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
}

const DeliveryTypeType = {
  0 : 'STANDARD',
  1 : 'EXPRESS',
}

export function getDeliveryType (type: number){
  return DeliveryTypeType[type] ?? undefined;
}


//for order status
export enum StatusType {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  SHIPPED = 'SHIPPED',
}

const Status = {
  0 : 'PENDING',
  1 : 'CONFIRMED',
  2 : 'CANCELED',
  3 : 'SHIPPED'
}

export function getStatus (type: number){
  return Status[type] ?? undefined;
}


