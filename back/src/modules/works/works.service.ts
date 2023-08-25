import { HttpException, Injectable } from '@nestjs/common';
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
import { Queries } from './dtos/works-query.interface';
import { UserService } from '../user/user.service';
import { User, UserRole } from 'src/typeorm/entitys/user.entity';
import { UpdateWorkDto } from './dtos/update.dto';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private readonly worksRepository: Repository<Work>,

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

      const isHaveAccess = role
        .map((r) => r.role)
        .some((r) => [UserRole.ADMIN, UserRole.MODERATOR].indexOf(r) !== -1);

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
      user.role.some((r) => [UserRole.MODERATOR].indexOf(r.role) !== -1)
    ) {
      throw new HttpException(
        'You do not have permission to change vision',
        403,
      );
    }

    if (
      body.hidden !== undefined &&
      user.role.some((r) => [UserRole.ADMIN].indexOf(r.role) !== -1)
    ) {
      work.hidden = body.hidden;
    }

    if (body.displayName) {
      work.displayName = body.displayName;
    }

    await this.worksRepository.save(work);

    return work;
  }
}
