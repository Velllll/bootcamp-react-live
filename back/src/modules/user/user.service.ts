import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entitys/user.entity';
import { ILike, Repository } from 'typeorm';
import { QueriesForListOfUsers } from './dtos/user-list.dto';
import { MetaData } from 'src/interfaces/meta.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async getList(queries: QueriesForListOfUsers) {
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
}
