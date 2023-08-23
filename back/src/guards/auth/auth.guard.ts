import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { JWT_ACCESS_SECRET } from 'src/config';
import { REFRESH_TOKEN_NAME } from 'src/modules/auth/auth.controller';
import { User } from 'src/typeorm/entitys/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedException();
      }

      const token = authHeader.split(' ')[1];

      const user = await this.jwtService.verify(token, {
        // secret: process.env.JWT_ACCESS_SECRET,
        secret: JWT_ACCESS_SECRET,
      });

      const userInDb = await this.usersRepository.findOne({
        where: { id: user.userid },
      });

      const { refreshToken, ...info } = userInDb;
      req.user = {
        login: userInDb.login,
        id: userInDb.id,
      };
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
