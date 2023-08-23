import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Work } from 'src/typeorm/entitys/events.entity';
import {
  And,
  ArrayContains,
  Between,
  ILike,
  In,
  Like,
  MoreThan,
  Repository,
} from 'typeorm';
import { Queries } from './dtos/works-query.interface';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { OpenAlexService } from '../download-works-modules/open-alex/open-alex.service';
import { EditAuthorDto } from './dtos/edit-authors.dto';
import { Authorships } from 'src/typeorm/entitys/events.entity';
import { EditVisibilityDto } from './dtos/edit-visibility.dto';
import { ResultsOpenAlex } from 'src/interfaces/open-alex-event.interface';
import { ScimagojrService } from '../download-works-modules/scimagojr/scimagojr.service';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private readonly worksRepository: Repository<Work>,
  ) {}

  async getAllWorks(queries: Queries) {
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
}
