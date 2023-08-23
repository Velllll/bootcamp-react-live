import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos/login.dto';
import { Request, Response } from 'express';
import { AccessGuard } from 'src/guards/access/access.guard';
import { AuthGuard } from 'src/guards/auth/auth.guard';

export const REFRESH_TOKEN_NAME = 'Unna32pqign734fO6';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() registerDto: RegisterDto,
  ) {
    const userData = await this.authService.register(
      registerDto.login,
      registerDto.name,
      registerDto.password,
    );

    res.cookie(REFRESH_TOKEN_NAME, userData.tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return {
      accessToken: userData.tokens.accessToken,
      userData: userData.user,
    };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userData = await this.authService.login(
      loginDto.login,
      loginDto.password,
    );

    res.cookie(REFRESH_TOKEN_NAME, userData.tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return {
      accessToken: userData.tokens.accessToken,
      userData: userData.user,
    };
  }

  @Get('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const refreshTokenReq: string = request.cookies?.[REFRESH_TOKEN_NAME];

    if (!refreshTokenReq) {
      throw new UnauthorizedException();
    }

    response.clearCookie(REFRESH_TOKEN_NAME);

    return {
      message: 'Logout success',
    };
  }

  @Get('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshTokenReq: string = request.cookies?.[REFRESH_TOKEN_NAME];

    const userData = await this.authService.refresh(refreshTokenReq);

    response.cookie(REFRESH_TOKEN_NAME, userData.tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      accessToken: userData.tokens.accessToken,
      userData: userData.user,
    };
  }

  @Get('access')
  @UseGuards(AccessGuard)
  @UseGuards(AuthGuard)
  async access(@Req() request) {
    return request.user;
  }
}
