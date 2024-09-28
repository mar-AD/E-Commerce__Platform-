import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {
  }

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, { expiresIn: '15d' });
  }
}