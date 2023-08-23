import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { catchError, firstValueFrom, of, retry } from 'rxjs';
import * as csv from 'csvtojson';
import { resolve } from 'path';

interface Journal {
  year: number;
  issn: string[];
  h_index: string;
}

@Injectable()
export class ScimagojrService {
  constructor(private http: HttpService) {}

  async getHIndexByIssn(issn: string[], year: number) {
    try {
      const issns = issn.map((i) => i.replace('-', ''));

      let journal: Journal[] = await this.readJournal(year);

      if (journal.length !== 0) {
        const journalByIssn = journal.find((item) => {
          return item.issn?.some((i) => issns.includes(i));
        });
        return journalByIssn.h_index;
      } else {
        return null;
      }
    } catch (error) {}
  }

  //for schedule refresh
  async downloadJournalJsonByYear(year: number) {
    try {
      console.log('start download journal', year);
      const download = await this.downloadJournal(year);

      if (download) {
        const data = await this.getJsonFromCsv(year);

        await this.writeJsonFile(data, year);
      }
    } catch (error) {
      throw error;
    }
  }

  private async downloadJournal(year: number): Promise<boolean> {
    try {
      const url = `https://www.scimagojr.com/journalrank.php?year=${year}&out=xls`;

      const path = resolve(__dirname, `../../../assets/journals`);

      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }

      if (existsSync(path + `/journal_${year}.csv`)) {
        rmSync(path + `/journal_${year}.csv`);
      }

      const file = createWriteStream(path + `/journal_${year}.csv`);

      const response$ = this.http.get(url, { responseType: 'stream' }).pipe(
        retry({ count: 10, delay: 10000 }),
        catchError((e) => {
          return of(e);
        }),
      );

      const response = (await firstValueFrom(response$)).data;

      return new Promise((resolve, reject) => {
        response.pipe(file);
        let error: Error | null = null;
        file.on('error', (err: Error) => {
          error = err;
          file.close();
          reject(err);
        });
        file.on('close', () => {
          if (!error) {
            resolve(true);
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  private async getJsonFromCsv(year: number) {
    try {
      const path = resolve(
        __dirname,
        `../../../assets/journals/journal_${year}.csv`,
      );

      const data = await csv({
        delimiter: ';',
      }).fromFile(path);

      const dataJson = data.map((item) => {
        return {
          h_index: item['SJR Best Quartile'],
          year: year,
          issn: item['Issn']?.split(', '),
        };
      });

      return dataJson;
    } catch (error) {
      throw error;
    }
  }

  private async writeJsonFile(data: any, year: number) {
    const jsonPath = resolve(
      __dirname,
      `../../../assets/journals/journal_${year}.json`,
    );
    if (existsSync(jsonPath)) {
      unlinkSync(jsonPath);
    }
    writeFileSync(jsonPath, JSON.stringify(data));
  }

  private async readJournal(year: number): Promise<Journal[]> {
    try {
      const path = resolve(
        __dirname,
        `../../../assets/journals/journal_${year}.json`,
      );

      const data = readFileSync(path, 'utf8');

      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
}
