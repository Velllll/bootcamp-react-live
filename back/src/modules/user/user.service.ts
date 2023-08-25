import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles, User, UserRole } from 'src/typeorm/entitys/user.entity';
import { ILike, Repository } from 'typeorm';
import { QueriesForListOfUsers } from './dtos/user-list.dto';
import { MetaData } from 'src/interfaces/meta.interface';
import { Actions, ManageRoleDto } from './dtos/manage-user.role.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {}

  async getUser(query: { login?: string; id?: number }) {
    const user = await this.usersRepository.findOne({
      where: {
        login: query.login,
        id: query.id,
      },
      relations: {
        role: true,
      },
    });

    const { password, refreshToken, ...result } = user;

    return result;
  }

  async getListOfUsers(queries: QueriesForListOfUsers) {
    if (!queries.page) queries.page = 1;
    if (!queries.limit) queries.limit = 10;

    const { limit, page, login, name, role } = queries;

    const where: any = {};

    if (login) {
      where.login = ILike(`%${login}%`);
    }

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    if (role) {
      where.role = {
        role,
      };
    }

    const [users, count] = await this.usersRepository.findAndCount({
      where,
      relationLoadStrategy: 'query',
      relations: {
        role: true,
      },
      select: {
        id: true,
        login: true,
        role: true,
        name: true,
      },
    });

    const meta: MetaData = {
      count,
      number_of_pages: Math.ceil(count / limit),
      page,
      limit,
    };

    return {
      users,
      meta,
    };
  }

  async manageUserRoles(dto: ManageRoleDto, userModerateId: number) {
    const { userId, role, action } = dto;

    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        role: true,
      },
    });

    const userModerate = await this.usersRepository.findOne({
      where: {
        id: userModerateId,
      },
      relations: {
        role: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (role === UserRole.USER) {
      throw new HttpException('You can not change USER role', 400);
    }

    const isUserHaveRole = user.role.some((userRole) => {
      return userRole.role === role;
    });

    const isManageUserAdmin = userModerate.role.some((userRole) => {
      return userRole.role === UserRole.ADMIN;
    });

    if (action === Actions.ADD) {
      if (isUserHaveRole) {
        throw new HttpException('User already have this role', 400);
      }

      if (role === UserRole.ADMIN && !isManageUserAdmin) {
        throw new HttpException('You can not add admin role', 400);
      }
      if (
        role === UserRole.MODERATOR &&
        user.role.some((userRole) => {
          return userRole.role === UserRole.ADMIN;
        })
      ) {
        throw new HttpException('You can not add moderator role to admin', 400);
      }

      const roleToAdd = await this.rolesRepository.save({
        role,
        user,
      });

      user.role = [...user.role, roleToAdd];
    }

    if (action === Actions.REMOVE) {
      if (!isUserHaveRole) {
        throw new HttpException('User does not have this role', 400);
      }

      if (role === UserRole.ADMIN && !isManageUserAdmin) {
        throw new HttpException('You can not remove admin role', 400);
      }

      await this.rolesRepository
        .createQueryBuilder()
        .delete()
        .from(Roles)
        .where('user_id = :id', { id: userId })
        .andWhere('role = :role', { role: role })
        .execute();

      return {
        message: 'User role has been changed',
      };
    }

    return {
      message: 'User role has been changed',
    };
  }
}
