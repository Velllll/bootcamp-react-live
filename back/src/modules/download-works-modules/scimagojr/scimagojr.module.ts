import { Module } from '@nestjs/common';
import { ScimagojrService } from './scimagojr.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ScimagojrService],
  exports: [ScimagojrService],
})
export class ScimagojrModule {}
