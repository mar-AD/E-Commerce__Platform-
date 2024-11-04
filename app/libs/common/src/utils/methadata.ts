import { CustomDecorator, SetMetadata } from '@nestjs/common';

interface permissionAndAccessTypeOptions {
  accessType: ('admin' | 'user')[];
  permission?: string
}

export const PermissionsAndAccess = (options: permissionAndAccessTypeOptions): CustomDecorator<string> => {
  return SetMetadata("AccessTypeAndPermissions", options)
}
