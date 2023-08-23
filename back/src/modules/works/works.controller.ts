import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { WorksService } from './works.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { QueryDto } from './dtos/work-querys.dto';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get('')
  @UseGuards(AuthGuard)
  async getWorks(@Query() queries: QueryDto, @Req() req) {
    const works = await this.worksService.getAllWorks(queries);

    return works;
  }
}
