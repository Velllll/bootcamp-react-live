import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Work } from 'src/typeorm/entitys/work.entity';
import {
  And,
  ArrayContains,
  Between,
  ILike,
  In,
  Like,
  Repository,
} from 'typeorm';
import { Pages, Queries } from './dtos/works-query.interface';
import { UserService } from '../user/user.service';
import { User, UserRole } from 'src/typeorm/entitys/user.entity';
import { UpdateWorkDto } from './dtos/update.dto';
import { UserWorkCollection } from 'src/typeorm/entitys/user-work-collection.entity';
import { join, resolve } from 'path';
import { existsSync, mkdir } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { Workbook } from 'exceljs';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private readonly worksRepository: Repository<Work>,
    @InjectRepository(UserWorkCollection)
    private readonly userWorkCollectionRepository: Repository<UserWorkCollection>,

    private userService: UserService,
  ) {}

  async getAllWorks(queries: Queries, userid: number) {
    if (!queries.page) queries.page = 1;
    if (!queries.limit) queries.limit = 10;

    const where: any = {};

    if (queries.lastname) {
      where.authorships = {
        displayName: ILike(`%${queries.lastname}%`),
      };
    }

    if (queries.orcid) {
      where.authorships = {
        orcid: ILike(`%${queries.orcid}%`),
      };
    }

    if (queries.title) {
      where.displayName = ILike(`%${queries.title}%`);
    }

    if (queries.doi) {
      where.doi = Like(`%${queries.doi}%`);
    }

    if (queries.issn) {
      const issn = queries.issn.includes('-')
        ? queries.issn
        : queries.issn.slice(0, 4) + '-' + queries.issn.slice(4);
      where.primaryLocation = {
        issn: ArrayContains([issn]),
      };
    }

    if (queries.subject) {
      where.concepts = {
        conceptName: ILike(`%${queries.subject}%`),
      };
    }

    if (queries.hIndex) {
      where.hIndex = ILike(`%${queries.hIndex}%`);
    }

    if (
      (queries.dateFromYear && !queries.dateToYear) ||
      (!queries.dateFromYear && queries.dateToYear)
    ) {
      throw new HttpException(
        'dateFromYear and dateToYear must be both or none',
        400,
      );
    }

    if (queries.dateFromYear && queries.dateToYear) {
      where.publication_date = Between(
        new Date(`${queries.dateFromYear}-01-01`),
        new Date(`${queries.dateToYear}-12-31`),
      );
    }

    if (queries.access) {
      where.openAccess = {
        is_oa: queries.access,
      };
    }

    if (queries.hidden !== undefined) {
      const user = await this.userService.getUser({ id: userid });
      const role = user.role;

      const isHaveAccess = role.some(
        (r) => [UserRole.ADMIN, UserRole.MODERATOR].indexOf(r) !== -1,
      );

      if (isHaveAccess) {
        where.hidden = queries.hidden;
      }
    }

    const works = (
      await this.worksRepository.find({
        where,
        relations: {
          primaryLocation: true,
          authorships: true,
          biblio: true,
          concepts: true,
          openAccess: true,
        },
        order: {
          hIndex: {
            direction: 'asc',
          },
          publication_date: 'DESC',
        },
        skip: queries.page * queries.limit - queries.limit,
        take: queries.limit,
      })
    ).map((work) => {
      const authorships = [...work.authorships].sort((a, b) => {
        if (a.authorPosition === b.authorPosition) {
          return 0;
        }
        if (a.authorPosition === 'first' || b.authorPosition === 'last') {
          return -1;
        }
        if (b.authorPosition === 'first' || a.authorPosition === 'last') {
          return 1;
        }
        return 0;
      });

      return {
        ...work,
        authorships,
      };
    });

    const count = await this.worksRepository.count({
      where,
    });
    const number_of_pages = Math.ceil(count / queries.limit);

    const meta = {
      count,
      number_of_pages,
      page: +queries.page,
      limit: queries.limit,
    };

    return {
      works,
      meta,
    };
  }

  async updateWork(body: UpdateWorkDto, userid: number) {
    const user = await this.userService.getUser({ id: userid });

    const work = await this.worksRepository.findOne({
      where: {
        workid: body.workid,
      },
      relations: {
        primaryLocation: true,
        authorships: true,
        biblio: true,
        concepts: true,
        openAccess: true,
      },
    });

    if (!work) {
      throw new HttpException('Work not found', 404);
    }

    if (body.hIndex !== undefined) {
      work.hIndex = body.hIndex;
    }

    if (
      body.hidden !== undefined &&
      user.role.some((r) => [UserRole.MODERATOR].indexOf(r) !== -1)
    ) {
      throw new HttpException(
        'You do not have permission to change visibility',
        403,
      );
    }

    if (
      body.hidden !== undefined &&
      user.role.some((r) => [UserRole.ADMIN].indexOf(r) !== -1)
    ) {
      work.hidden = body.hidden;
    }

    if (body.displayName) {
      work.displayName = body.displayName;
    }

    await this.worksRepository.save(work);

    return work;
  }

  async addWorkToUserCollection(workid: number, userid: number) {
    const user = await this.userService.getUserReference({ id: userid });

    const work = await this.worksRepository.findOne({
      where: {
        workid,
      },
    });

    if (!work) {
      throw new HttpException('Work not found', 404);
    }

    await this.userWorkCollectionRepository.save({
      user,
      work,
    });

    return {
      message: 'Work added to collection',
    };
  }

  async deleteWorkFromUserCollection(workid: number, userid: number) {
    const user = await this.userService.getUserReference({ id: userid });

    const work = await this.worksRepository.findOne({
      where: {
        workid,
      },
    });

    if (!work) {
      throw new HttpException('Work not found', 404);
    }

    await this.userWorkCollectionRepository
      .createQueryBuilder('userWorkCollection')
      .delete()
      .from(UserWorkCollection)
      .where('user_id = :id', { id: user.id })
      .andWhere('work_id = :workid', { workid })
      .execute();

    return {
      message: 'Work deleted from collection',
    };
  }

  async deleteAllWorksFromCollection(userid: number) {
    await this.userWorkCollectionRepository
      .createQueryBuilder('userWorkCollection')
      .delete()
      .from(UserWorkCollection)
      .where('user_id = :id', { id: userid })
      .execute();

    return {
      message: 'All works deleted from collection',
    };
  }

  async getUserCollection(userid: number, queries: Pages) {
    if (!queries.page) queries.page = 1;
    if (!queries.limit) queries.limit = 10;

    const user = await this.userService.getUserReference({ id: userid });

    const works = await this.userWorkCollectionRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['work'],
      skip: queries.page * queries.limit - queries.limit,
      take: queries.limit,
    });

    const count = await this.userWorkCollectionRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
    const number_of_pages = Math.ceil(count / queries.limit);

    const meta = {
      count,
      number_of_pages,
      page: +queries.page,
      limit: queries.limit,
    };

    return {
      works: works.map((work) => work.work),
      meta,
    };
  }

  async createCollectionReport(userid: number) {
    try {
      const folderPath = resolve(__dirname, '..', '..', 'static');

      if (!existsSync(folderPath)) {
        mkdir(folderPath, { recursive: true }, (error) => {
          if (error) {
            throw new HttpException(
              'Ошибка при создании отчета',
              HttpStatus.BAD_REQUEST,
            );
          }
        });
      }

      const collection = await this.userWorkCollectionRepository.find({
        where: {
          user: {
            id: userid,
          },
        },
        relations: {
          work: {
            authorships: true,
            primaryLocation: true,
          },
        },
      });

      const fileName = await this.createEventReport(
        collection.map((w) => w.work),
        folderPath,
      );

      setTimeout(() => {
        unlink(join(folderPath, fileName));
      }, 30000);

      const file = await readFile(join(folderPath, fileName));

      return file;
    } catch (error) {
      throw new HttpException(
        'Ошибка при создании отчета',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async createEventReport(
    collection: Work[],
    folderPath: string,
  ): Promise<string> {
    try {
      const fileName = 'my-collection' + '.xlsx';

      const workbook = new Workbook();

      const worksheet = workbook.addWorksheet('Отчет');

      worksheet.columns = [
        { header: '#', key: 'index', width: 5 },
        { header: 'title', key: 'title', width: 40 },
        { header: 'id', key: 'id', width: 5 },
        { header: 'authors', key: 'authors', width: 20 },
        { header: 'doi', key: 'doi', width: 20 },
        { header: 'issn', key: 'issn', width: 20 },
        { header: 'publication date', key: 'publication_date', width: 15 },
        { header: 'h index', key: 'hIndex', width: 5 },
      ];

      const reportInfo = collection.map((collection, index) => {
        const authors = collection.authorships
          .sort((a, b) => {
            if (a.authorPosition === b.authorPosition) {
              return 0;
            }
            if (a.authorPosition === 'first' || b.authorPosition === 'last') {
              return -1;
            }
            if (b.authorPosition === 'first' || a.authorPosition === 'last') {
              return 1;
            }
            return 0;
          })
          .map((author) => author.displayName)
          .join(', ');

        return {
          index: index + 1,
          title: collection?.displayName,
          id: collection?.workid,
          authors,
          doi: collection?.doi,
          issn: collection.primaryLocation?.issn?.join(', '),
          publication_date: collection?.publication_date,
          hIndex: collection?.hIndex,
        };
      });

      worksheet.addRows(reportInfo);

      await workbook.xlsx.writeFile(join(folderPath, fileName));

      return fileName;
    } catch (error) {
      throw new HttpException(
        'Ошибка при создании отчета',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
