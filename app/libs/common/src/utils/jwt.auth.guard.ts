import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { isPublicKey } from '@app/common/utils/methadata';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(isPublicKey, context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const payload = request.user;

    console.log('jwtauthguard',payload);
    if (request.url.includes('user/register') && !payload){
      return true
    }

    if (request.url.includes('user/register') && payload && payload.type !== 'admin') {
      return false;
    }

    return super.canActivate(context);
  }
}