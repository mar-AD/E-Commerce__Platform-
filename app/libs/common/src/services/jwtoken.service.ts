import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  id: string;
  type: string
}

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {
  }

  generateAccessToken(payload: JwtPayload): string {
    try {
      return this.jwtService.sign(payload, { expiresIn: '1h' });
    }
    catch (error) {
      throw new InternalServerErrorException('Error generating access token:', error);
    }
  }

  generateRefreshToken(payload: JwtPayload): string {
    try {
      return this.jwtService.sign(payload, { expiresIn: '15d' });
    }
    catch (error) {
      throw new InternalServerErrorException('Error generating refresh token:', error);
    }
  }
}