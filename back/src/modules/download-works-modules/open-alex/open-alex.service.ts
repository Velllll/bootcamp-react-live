import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  catchError,
  expand,
  firstValueFrom,
  map,
  of,
  retry,
  switchMap,
  take,
} from 'rxjs';
import {
  ResultsOpenAlex,
  WorksOpenAlex,
} from 'src/interfaces/open-alex-event.interface';
import {
  Authorships,
  Biblio,
  Concept,
  Work,
  OpenAccess,
  PrimaryLocation,
} from 'src/typeorm/entitys/work.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class OpenAlexService {
  uniId = 'I3018660459';

  private allWorks: ResultsOpenAlex[] = [];

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Work)
    private readonly eventsRepository: Repository<Work>,
    @InjectRepository(Biblio)
    private readonly biblioRepository: Repository<Biblio>,
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
    @InjectRepository(Authorships)
    private readonly authorshipsRepository: Repository<Authorships>,
    @InjectRepository(OpenAccess)
    private readonly openAccessRepository: Repository<OpenAccess>,
    @InjectRepository(PrimaryLocation)
    private readonly primaryLocationRepository: Repository<PrimaryLocation>,
  ) {}

  async updateUniWorksInDb() {
    this.allWorks = [];
    const works = await this.getUniWorks(1);
    const addedWorks = await this.setWorksToDb(works);
    return addedWorks;
  }

  async updateHIndex(doi: string, hIndex: string) {
    const validIndex = hIndex === '-' ? null : hIndex;

    await this.eventsRepository
      .createQueryBuilder()
      .update(Work)
      .set({ hIndex: validIndex })
      .where('doi = :doi', { doi })
      .execute();
  }

  async getAllWorks() {
    return await this.eventsRepository.find({
      relations: {
        primaryLocation: true,
      },
    });
  }

  private async getUniWorks(page: number): Promise<ResultsOpenAlex[]> {
    try {
      console.log('page: ', page);
      const url = `https://api.openalex.org/works?filter=institutions.id:${this.uniId}&per-page=200&page=${page}`;
      const response$ = this.httpService.get<WorksOpenAlex>(url).pipe(
        retry({ count: 10, delay: 10000 }),
        catchError((e) => {
          return of(e);
        }),
      );

      const response: WorksOpenAlex = (
        await firstValueFrom(response$, {
          defaultValue: {
            meta: {
              count: 0,
            },
            results: [],
          },
        })
      ).data;

      const works = response.results;
      this.allWorks = [...this.allWorks, ...works];

      if (response.meta.count > this.allWorks.length) {
        return await this.getUniWorks(page + 1);
      } else {
        return this.allWorks;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  private async setWorksToDb(works: ResultsOpenAlex[]) {
    let count = 0;

    for (let i = 0; i < works.length; i++) {
      const work = works[i];

      const exist = await this.eventsRepository.findOne({
        where: [
          {
            displayName: work.display_name,
          },
          {
            doi: work.doi,
          },
        ],
      });

      if (!exist) {
        await this.saveWorkToDb(work);
        count++;
      }
    }

    return count;
  }

  async saveWorkToDb(work: ResultsOpenAlex) {
    const exist = await this.eventsRepository.findOne({
      where: [
        {
          displayName: work.display_name,
        },
        {
          doi: work.doi,
        },
      ],
    });

    if (exist) {
      return false;
    }

    const biblio = await this.biblioRepository.save({
      firstPage: work.biblio?.first_page,
      lastPage: work.biblio?.last_page,
      issue: work.biblio?.issue,
      volume: work.biblio?.volume,
    });

    let concepts = [];
    if (work.concepts) {
      for (let j = 0; j < work.concepts.length; j++) {
        const concept = work.concepts[j];
        concepts = [
          ...concepts,
          await this.conceptRepository.save({
            conceptName: concept.display_name,
          }),
        ];
      }
    }

    let authorships = [];
    if (work.authorships) {
      for (let j = 0; j < work.authorships.length; j++) {
        const authorship = work.authorships[j];
        authorships = [
          ...authorships,
          await this.authorshipsRepository.save({
            authorOpenAlexId: authorship?.author.id,
            authorPosition: authorship?.author_position,
            displayName: authorship.author.display_name,
            orcid: authorship.author?.orcid,
            institutionsId: authorship.institutions[0]?.id,
            institutionName: authorship.institutions[0]?.display_name,
          }),
        ];
      }
    }

    const openAccess = await this.openAccessRepository.save({
      is_oa: work.open_access?.is_oa,
      oa_status: work.open_access?.oa_status,
      oa_url: work.open_access?.oa_url,
    });

    const primaryLocation = await this.primaryLocationRepository.save({
      is_oa: work.primary_location?.is_oa,
      issn:
        work.primary_location?.source?.issn ||
        work.primary_location?.venue?.issn ||
        [],
      jornalName:
        work.primary_location?.source?.display_name ||
        work.primary_location?.venue?.display_name,
      landing_page_url: work.primary_location?.landing_page_url,
    });

    await this.eventsRepository.save({
      doi: work.doi,
      displayName: work.display_name,
      language: work.language,
      authorships: authorships,
      biblio: biblio,
      concepts: concepts,
      openAccess: openAccess,
      primaryLocation: primaryLocation,
      cited_by_count: work.cited_by_count,
      publication_date: new Date(work.publication_date),
      type: work.type,
    });

    return true;
  }
}
