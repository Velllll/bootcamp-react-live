import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OpenAlexService } from '../download-works-modules/open-alex/open-alex.service';
import { ScimagojrService } from '../download-works-modules/scimagojr/scimagojr.service';
import { existsSync, rmdir, rmdirSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class LoaderService {
  constructor(
    private scimagojrService: ScimagojrService,
    private openAlexService: OpenAlexService,
  ) {}

  async updateWorks() {
    try {
      console.log('start update works');
      const numberOfUpdatedWorks =
        await this.openAlexService.updateUniWorksInDb();
      console.log(`Updated ${numberOfUpdatedWorks} works`);

      const dir = resolve(__dirname, '../../assets/journals');
      if (existsSync(dir)) {
        rmdirSync(dir, { recursive: true });
      }
      for (let year = 2000; year <= new Date().getFullYear(); year++) {
        await this.scimagojrService.downloadJournalJsonByYear(year);
      }
      console.log(`Updated scimagojr`);

      const works = await this.openAlexService.getAllWorks();

      for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const year = new Date(work.publication_date).getFullYear();
        const issn = work.primaryLocation?.issn.map((issn) =>
          issn.replace('-', ''),
        );
        if (issn) {
          const hIndex = await this.scimagojrService.getHIndexByIssn(
            issn,
            year,
          );

          if (work.hIndex !== hIndex) {
            if (work.doi && hIndex) {
              await this.openAlexService.updateHIndex(work.doi, hIndex);
            }
          }
        }
      }
      console.log('Updated all db');
    } catch (error) {
      console.log('Error update works');
      console.log(error);
    }
  }
}
