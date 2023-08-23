import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from './roles-auth.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/typeorm/entitys/user.entity';

// example of use
// @UseGuards(RoleGuard)
// @Role(UserRole.ADMIN)
// @UseGuards(AuthGuard)
// @Get('')
// ...

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rolesRequire = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    const req = context.switchToHttp().getRequest();

    const user: {
      login: string;
      id: number;
    } = req.user;

    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new HttpException('Нет доступа', HttpStatus.FORBIDDEN);
    }

    const userInDb = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: {
        role: true,
      },
    });

    if (!userInDb) {
      throw new HttpException('Пользователь не найден', HttpStatus.FORBIDDEN);
    }

    const userRoles = userInDb.role.map((r) => r.role);
    if (rolesRequire.some((role: UserRole) => userRoles.includes(role))) {
      return true;
    } else {
      throw new HttpException('Нет доступа', HttpStatus.FORBIDDEN);
    }
  }
}
