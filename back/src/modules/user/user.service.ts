import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entitys/user.entity';
import { Repository } from 'typeorm';

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

    return user;
  }
}
