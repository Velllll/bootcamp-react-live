import { Module } from '@nestjs/common';
import { OpenAlexService } from './open-alex.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/typeorm/entities';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature(entities)],
  providers: [OpenAlexService],
  exports: [OpenAlexService],
})
export class OpenAlexModule {}
