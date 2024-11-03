import { Permissions } from '@app/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

export enum AuthConstants {
  admin = 'admin',
  user = 'user'
}

// export type PermissionsNameKeys = keyof typeof PermissionsName;

export const findDuplicates = (permissions : Permissions[]) =>{
  if (!permissions || permissions.length === 0){
     throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: 'Please select at least one permission to proceed.',
    })
  }
  const unique = new Set();
  const duplicate = new Set()

  permissions.forEach((permission) => {
    if (unique.has(permission)) {
      duplicate.add(permission);
    }else{
      unique.add(permission);
    }
  })
  return Array.from(duplicate)
}

export const arraysEqual = (arr1: Permissions[], arr2: Permissions[]): boolean => {
  if (arr1.length !== arr2.length) return false;

  // Sort and compare each element
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  return sortedArr1.every((value, index) => value === sortedArr2[index]);
};