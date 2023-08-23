import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FacultyList,
  JobList,
  ScienceCentreList,
} from 'src/typeorm/entitys/lists.entity';
import { GuardsModule } from 'src/guards/guards.module';

@Module({
  controllers: [ListsController],
  providers: [ListsService],
  imports: [
    TypeOrmModule.forFeature([FacultyList, JobList, ScienceCentreList]),
    GuardsModule,
  ],
})
export class ListsModule {}
