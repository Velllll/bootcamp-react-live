import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FacultyList,
  JobList,
  ScienceCentreList,
} from 'src/typeorm/entitys/lists.entity';
import { Repository } from 'typeorm';
import { ListType } from './dtos/list.dto';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(FacultyList)
    private readonly facultyListRepository: Repository<FacultyList>,
    @InjectRepository(JobList)
    private readonly jobListRepository: Repository<JobList>,
    @InjectRepository(ScienceCentreList)
    private readonly scienceCentreListRepository: Repository<ScienceCentreList>,
  ) {}

  async getList(type: ListType[]) {
    let lists: {
      faculty?: FacultyList[];
      job?: JobList[];
      scienceCentre?: ScienceCentreList[];
    } = {};

    if (type.includes(ListType.FACULTY)) {
      const faculty = await this.facultyListRepository.find();
      lists.faculty = faculty;
    }
    if (type.includes(ListType.JOB)) {
      const job = await this.jobListRepository.find();
      lists.job = job;
    }
    if (type.includes(ListType.SCIENCE_CENTRE)) {
      const scienceCentre = await this.scienceCentreListRepository.find();
      lists.scienceCentre = scienceCentre;
    }

    return lists;
  }

  async addList(type: ListType, name: string) {
    if (type === ListType.FACULTY) {
      const faculty = await this.facultyListRepository.findOne({
        where: { name },
      });

      if (faculty) {
        throw new HttpException('Такой факультет уже существует', 400);
      }

      return await this.facultyListRepository.save({ name });
    }
    if (type === ListType.JOB) {
      const job = await this.jobListRepository.findOne({
        where: { name },
      });

      if (job) {
        throw new HttpException('Такая работа уже существует', 400);
      }

      return await this.jobListRepository.save({ name });
    }
    if (type === ListType.SCIENCE_CENTRE) {
      const scienceCentre = await this.scienceCentreListRepository.findOne({
        where: { name },
      });

      if (scienceCentre) {
        throw new HttpException('Такой научный центр уже существует', 400);
      }

      return await this.scienceCentreListRepository.save({ name });
    }
  }

  async removeList(type: ListType, id: number) {
    if (type === ListType.FACULTY) {
      const faculty = await this.facultyListRepository.findOne({
        where: { id },
      });

      if (!faculty) {
        throw new HttpException('Факультет не найден', 404);
      }

      await this.facultyListRepository.delete({ id });
    }
    if (type === ListType.JOB) {
      const job = await this.jobListRepository.findOne({
        where: { id },
      });

      if (!job) {
        throw new HttpException('Работа не найдена', 404);
      }

      await this.jobListRepository.delete({ id });
    }
    if (type === ListType.SCIENCE_CENTRE) {
      const scienceCentre = await this.scienceCentreListRepository.findOne({
        where: { id },
      });

      if (!scienceCentre) {
        throw new HttpException('Научный центр не найден', 404);
      }

      await this.scienceCentreListRepository.delete({ id });
    }

    return { message: 'Успешно удалено' };
  }

  async updateList(type: ListType, id: number, name: string) {
    if (type === ListType.FACULTY) {
      const faculty = await this.facultyListRepository.findOne({
        where: { id },
      });

      if (!faculty) {
        throw new HttpException('Факультет не найден', 404);
      }

      const isExist = await this.facultyListRepository.findOne({
        where: { name },
      });

      if (isExist) {
        throw new HttpException('Такой факультет уже существует', 400);
      }

      await this.facultyListRepository
        .createQueryBuilder()
        .update(FacultyList)
        .set({ name })
        .where('id = :id', { id })
        .execute();
    }

    if (type === ListType.JOB) {
      const job = await this.jobListRepository.findOne({
        where: { id },
      });

      if (!job) {
        throw new HttpException('Работа не найдена', 404);
      }

      const isExist = await this.jobListRepository.findOne({
        where: { name },
      });

      if (isExist) {
        throw new HttpException('Такая работа уже существует', 400);
      }

      await this.jobListRepository
        .createQueryBuilder()
        .update(JobList)
        .set({ name })
        .where('id = :id', { id })
        .execute();
    }

    if (type === ListType.SCIENCE_CENTRE) {
      const scienceCentre = await this.scienceCentreListRepository.findOne({
        where: { id },
      });

      if (!scienceCentre) {
        throw new HttpException('Научный центр не найден', 404);
      }

      const isExist = await this.scienceCentreListRepository.findOne({
        where: { name },
      });

      if (isExist) {
        throw new HttpException('Такой научный центр уже существует', 400);
      }

      await this.scienceCentreListRepository
        .createQueryBuilder()
        .update(ScienceCentreList)
        .set({ name })
        .where('id = :id', { id })
        .execute();
    }

    return { message: 'Данные обновлены' };
  }
}
