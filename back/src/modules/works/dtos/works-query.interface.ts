import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class Queries {
  page: number;
  limit: number;
  lastname: string;
  orcid: string;
  title: string;
  doi: string;
  issn: string;
  subject: string;
  hIndex: string;
  dateFromYear: string;
  dateToYear: string;

  @IsBoolean()
  @Transform(({ value }) => {
    return value === 'false' ? false : true;
  })
  @IsOptional()
  access: boolean;
}
