import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/role /role.guard';
import { UserRole } from 'src/typeorm/entitys/user.entity';
import { Roles } from 'src/guards/role /roles-auth.decorator';
import { RequestWithUser } from 'src/interfaces/request-user.interface';
import { QueriesForListOfUsers } from './dtos/user-list.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @UseGuards(AuthGuard)
  async getMyInfo(
    @Req()
    req: RequestWithUser,
  ) {
    const user = req.user;

    const userInfo = await this.userService.getUser({
      id: user.id,
    });

    return userInfo;
  }

  @Get('list')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @UseGuards(AuthGuard)
  async getListOfUsers(
    @Query()
    queries: QueriesForListOfUsers,
  ) {
    const users = await this.userService.getList(queries);

    return users;
  }
}
