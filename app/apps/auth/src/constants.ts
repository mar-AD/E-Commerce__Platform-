import { Permissions } from '@app/common';

export enum AuthConstants {
  admin = 'admin',
  user = 'user'
}

export const PermissionsName = {
  0: 'PERMISSION_UNSPECIFIED',
  1: 'VIEW_DASHBOARD',
  2: 'MANAGE_USERS',
  3: 'MANAGE_ORDERS',
  4: 'MANAGE_PRODUCTS',
  5: 'MANAGE_ROLES',
  '-1': 'UNRECOGNIZED',
} as const;

export type PermissionsNameKeys = keyof typeof PermissionsName;

export const findDuplicates = (permissions : Permissions[]) =>{
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

// Utility function for deep comparison of arrays
export const arraysEqual = (arr1: any[], arr2: any[]): boolean => {
  if (arr1.length !== arr2.length) return false;

  // Sort and compare each element
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  return sortedArr1.every((value, index) => value === sortedArr2[index]);
};