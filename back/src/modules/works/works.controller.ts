import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorksService } from './works.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Queries } from './dtos/works-query.interface';
import { Roles } from 'src/guards/role /roles-auth.decorator';
import { RoleGuard } from 'src/guards/role /role.guard';
import { UserRole } from 'src/typeorm/entitys/user.entity';
import { Request } from 'express';
import { UpdateWorkDto } from './dtos/update.dto';
import { RequestWithUser } from 'src/interfaces/request-user.interface';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get('')
  @UseGuards(AuthGuard)
  async getWorks(
    @Query() queries: Queries,
    @Req()
    req: RequestWithUser,
  ) {
    const user = req.user;

    const works = await this.worksService.getAllWorks(queries, user.id);

    return works;
  }

  @Patch('')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @UseGuards(AuthGuard)
  async updateWork(@Body() dto: UpdateWorkDto, @Req() req: RequestWithUser) {
    const user = req.user;

    const work = await this.worksService.updateWork(dto, user.id);

    return work;
  }
}
