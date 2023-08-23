import { Module } from '@nestjs/common';
import { WorksService } from './works.service';
import { WorksController } from './works.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/typeorm/entities';
import { GuardsModule } from 'src/guards/guards.module';
import { HttpModule } from '@nestjs/axios';
import { OpenAlexModule } from '../download-works-modules/open-alex/open-alex.module';
import { ScimagojrModule } from '../download-works-modules/scimagojr/scimagojr.module';

@Module({
  providers: [WorksService],
  controllers: [WorksController],
  imports: [
    TypeOrmModule.forFeature(entities),
    GuardsModule,
    HttpModule,
    OpenAlexModule,
    ScimagojrModule,
  ],
})
export class WorksModule {}
