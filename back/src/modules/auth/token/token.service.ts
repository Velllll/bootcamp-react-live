import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from 'src/config';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async generateTokens(userPayload: { login: string; userid: number }) {
    return {
      accessToken: this.jwtService.sign(userPayload, {
        expiresIn: '30d',
        // secret: process.env.JWT_ACCESS_SECRET,
        secret: JWT_ACCESS_SECRET,
      }),
      refreshToken: this.jwtService.sign(userPayload, {
        expiresIn: '10d',
        // secret: process.env.JWT_REFRESH_SECRET,
        secret: JWT_REFRESH_SECRET,
      }),
    };
  }

  async verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      // secret: process.env.JWT_REFRESH_SECRET,
      secret: JWT_REFRESH_SECRET,
    });
  }

  async verifyAccessToken(token: string) {
    return this.jwtService.verify(token, {
      // secret: process.env.JWT_ACCESS_SECRET,
      secret: JWT_ACCESS_SECRET,
    });
  }
}
