import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Roles, User, UserRole } from 'src/typeorm/entitys/user.entity';
import { Repository } from 'typeorm';
import { TokenService } from './token/token.service';
import { Hash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Roles)
    private readonly rolesRepo: Repository<Roles>,

    private readonly tokenService: TokenService,
  ) {}

  async register(login: string, name: string, password: string) {
    const isUserExist = await this.usersRepository.findOne({
      where: {
        login,
      },
    });

    if (isUserExist) {
      throw new HttpException(
        'User with this login have already exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    //crypt password vi bycrypt
    const passwordHash = password;

    const newUser: User = await this.usersRepository.save({
      login,
      name,
      password: passwordHash,
    });

    await this.rolesRepo.save({
      user: newUser,
      role: UserRole.USER,
    });

    const tokens = await this.tokenService.generateTokens({
      login,
      userid: newUser.id,
    });
    await this.saveRefreshToken(tokens.refreshToken, newUser.id);

    const user = await this.usersRepository.findOne({
      where: {
        id: newUser.id,
      },
    });
    const { refreshToken, password: pas, ...rest } = user;

    return {
      tokens,
      user: rest,
    };
  }

  async login(login: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: {
        login,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 401);
    }

    const tokens = await this.tokenService.generateTokens({
      login,
      userid: user.id,
    });
    await this.saveRefreshToken(tokens.refreshToken, user.id);

    const { refreshToken, password: pas, ...rest } = user;

    return {
      tokens,
      user: rest,
    };
  }

  async logout(userid: number) {
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({
        refreshToken: null,
      })
      .where('userid = :userid', { userid })
      .execute();
  }

  async refresh(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new HttpException('Неверный токен', 401);
      }

      const userid = (await this.tokenService.verifyRefreshToken(refreshToken))
        .userid;

      const user = await this.usersRepository.findOne({
        where: { id: userid, refreshToken: refreshToken },
      });

      if (!user) {
        throw new HttpException('Неверный токен', 401);
      }

      const tokens = await this.tokenService.generateTokens({
        login: user.login,
        userid,
      });
      await this.saveRefreshToken(tokens.refreshToken, userid);

      return {
        tokens,
        user: {
          id: user.id,
          name: user.name,
          login: user.login,
        },
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  // private async checkActiveDirectory(login: string, password: string) {
  //   try {
  //     const BASE_URL = 'https://digital.spmi.ru/backend_booking/api/v1/';
  //     const token = await (
  //       await axios.post(BASE_URL + 'auth/login', { login, password })
  //     ).data.token;
  //     const data = await (
  //       await axios.get(BASE_URL + 'users/login', { params: { token } })
  //     ).data;
  //     const user: any = {
  //       username: this.transformUsername(data.user_data.username),
  //       photoURL: data.user_data.photo?.url,
  //     };

  //     if (data.user_data.edu_profile) {
  //       // Студент
  //       user.isLecturerOrEmployee = false;
  //       const profile: any = {};
  //       profile.book_numb = data.user_data.edu_profile.book_numb;
  //       profile.cathedra = data.user_data.edu_profile.cathedra;
  //       profile.edu_dep = data.user_data.edu_profile.edu_dep;
  //       profile.edu_form = data.user_data.edu_profile.edu_form;
  //       profile.edu_qualification =
  //         data.user_data.edu_profile.edu_qualification;
  //       profile.edu_year = data.user_data.edu_profile.edu_year;
  //       user.profile = profile;
  //     } else {
  //       // Препод или сотрудник
  //       user.isLecturerOrEmployee = true;
  //       const jobs = data.user_data.jobs;
  //       const mainJob = jobs.find((x: any) => x.job_type == 'Основное');
  //       const job = mainJob ? mainJob : jobs[0];
  //       user.profile = job;
  //     }
  //     return user;
  //   } catch (error) {
  //     console.log(error);
  //     return undefined;
  //   }
  // }

  // private transformUsername(title: string) {
  //   const newTitle = title.split(' ');
  //   const firstLetter = newTitle[1][0];
  //   const secondLetter = newTitle[2][0];
  //   if (newTitle.length > 2) {
  //     return (
  //       newTitle[0] +
  //       ' ' +
  //       (firstLetter ? firstLetter + '. ' : '') +
  //       (secondLetter ? secondLetter + '.' : '')
  //     );
  //   } else {
  //     return title;
  //   }
  // }

  private async saveRefreshToken(refreshToken: string, userid: number) {
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ refreshToken: refreshToken })
      .where('id = :id', { id: userid })
      .execute();
  }
}
