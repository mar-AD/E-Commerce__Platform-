import { AuthConstants } from '../../../../apps/auth/src/constants';
import { SetMetadata } from '@nestjs/common';

interface permissionAndAccessTypeOptions {
  accessTye: AuthConstants.admin | AuthConstants.user;
  permission?: string
}

export const PermissionsAndAccess = (options: permissionAndAccessTypeOptions) => {
  SetMetadata('AccessTypeAndPermissions', options)
}