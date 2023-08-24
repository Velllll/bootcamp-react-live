import { Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { WorksService } from './works.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Queries } from './dtos/works-query.interface';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get('')
  @UseGuards(AuthGuard)
  async getWorks(@Query() queries: Queries, @Req() req) {
    const user: {
      login: string;
      id: number;
    } = req.user;

    const works = await this.worksService.getAllWorks(queries, user.id);

    return works;
  }

  @Patch('/:id')
  @UseGuards(AuthGuard)
  async updateWork() {}
}
