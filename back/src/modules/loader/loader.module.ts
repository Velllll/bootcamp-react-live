import { Module } from '@nestjs/common';

import { ScheduleModule } from '@nestjs/schedule';
import { OpenAlexModule } from '../download-works-modules/open-alex/open-alex.module';
import { ScimagojrModule } from '../download-works-modules/scimagojr/scimagojr.module';
import { LoaderService } from './loader.service';

@Module({
  providers: [LoaderService],
  imports: [OpenAlexModule, ScimagojrModule],
  exports: [LoaderService],
})
export class LoaderModule {}
