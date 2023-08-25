import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { WorksService } from './works.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Pages, Queries } from './dtos/works-query.interface';
import { Roles } from 'src/guards/role /roles-auth.decorator';
import { RoleGuard } from 'src/guards/role /role.guard';
import { UserRole } from 'src/typeorm/entitys/user.entity';
import { Request } from 'express';
import { UpdateWorkDto } from './dtos/update.dto';
import { RequestWithUser } from 'src/interfaces/request-user.interface';
import { UserColectionDto } from './dtos/user-collection.dto';

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

  @Post('user-collection')
  @UseGuards(AuthGuard)
  async addWorkToUserCollection(
    @Body() dto: UserColectionDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;

    const work = await this.worksService.addWorkToUserCollection(
      dto.workid,
      user.id,
    );

    return work;
  }

  @Post('remove-from-collection')
  @UseGuards(AuthGuard)
  async deleteWorkFromUserCollection(
    @Body() dto: UserColectionDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;

    const work = await this.worksService.deleteWorkFromUserCollection(
      dto.workid,
      user.id,
    );

    return work;
  }

  @Delete('remove-all-from-collection')
  @UseGuards(AuthGuard)
  async deleteAllWorkFromUserCollection(@Req() req: RequestWithUser) {
    const user = req.user;

    const work = await this.worksService.deleteAllWorksFromCollection(user.id);

    return work;
  }

  @Get('user-collection')
  @UseGuards(AuthGuard)
  async getUserCollection(
    @Req() req: RequestWithUser,
    @Query() queries: Pages,
  ) {
    const user = req.user;

    const works = await this.worksService.getUserCollection(user.id, queries);

    return works;
  }

  @Get('create-collection-report')
  @UseGuards(AuthGuard)
  async createCollectionReport(@Req() req: RequestWithUser) {
    const userid = req.user.id;
    const report = await this.worksService.createCollectionReport(userid);

    return new StreamableFile(report);
  }
}
