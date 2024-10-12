import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '@app/common/services/logger.service';

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
      throw new InternalServerErrorException('Error generating access token:', error);
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
      throw new InternalServerErrorException('Error generating refresh token:', error);
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
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

