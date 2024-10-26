import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '@app/common/services/logger.service';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { messages } from '@app/common/utils';

interface JwtPayload {
  id: string;
  type: string
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {
  }

  generateAccessToken(payload: JwtPayload): string {
    this.logger.log('Generating access token...');
    try {
      const token = this.jwtService.sign(payload, { expiresIn: '1h' });
      this.logger.log('Access token generated successfully.');
      return token;
    } catch (error) {
      this.logger.error(`Error generating access token: ${error}`);
      throw new RpcException({code: status.INTERNAL ,message:messages.TOKEN.FAILED_TO_GENERATE_ACC_TOKEN, error });
    }
  }

  generateRefreshToken(payload: JwtPayload): string {
    this.logger.log('Generating refresh token...');
    try {
      const token = this.jwtService.sign(payload, { expiresIn: '15d' });
      this.logger.log('Refresh token generated successfully.');
      return token;
    } catch (error) {
      this.logger.error(`Error generating refresh token: ${error}`);
      throw new RpcException({code: status.INTERNAL ,message: messages.TOKEN.FAILED_TO_GENERATE_REF_TOKEN, error });
    }
  }

  decodeToken(token: string): JwtPayload {
    this.logger.log('Decoding token...');
    try {
      const decoded: JwtPayload = this.jwtService.verify<JwtPayload>(token);
      this.logger.log('Token decoded successfully.');
      return decoded;
    } catch (error) {
      this.logger.error(`Invalid or expired token:${error}`);
      throw new RpcException({code: status.UNAUTHENTICATED ,message: messages.TOKEN.INVALID_OR_EXPIRED_TOKEN});
    }
  }
}

