import { CustomDecorator, SetMetadata } from '@nestjs/common';

interface permissionAndAccessTypeOptions {
  accessType: ('admin' | 'user')[];
  permission?: string
}

export const PermissionsAndAccess = (options: permissionAndAccessTypeOptions): CustomDecorator<string> => {
  return SetMetadata("AccessTypeAndPermissions", options)
}


//for the public endpoints
export const isPublicKey = 'IS_PUBLIC_KEY';
export const isPublic = () => {
  return SetMetadata(isPublicKey, true)
}