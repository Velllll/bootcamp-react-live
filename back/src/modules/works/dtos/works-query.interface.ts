import { HttpException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidationOptions,
} from 'class-validator';

export class Queries {
  @IsOptional()
  @Transform(({ value }) => {
    return value ? parseInt(value) : 1;
  })
  @IsNumber()
  page: number;

  @IsOptional()
  @Transform(({ value }) => {
    return value ? parseInt(value) : 10;
  })
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsString()
  orcid: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  doi: string;

  @IsOptional()
  @IsString()
  issn: string;

  @IsOptional()
  @IsString()
  subject: string;

  @IsOptional()
  @IsEnum(['Q1', 'Q2', 'Q3', 'Q4'], {
    message: 'must be Q1, Q2, Q3 or Q4',
  })
  hIndex: string;

  @IsOptional()
  @IsYear()
  dateFromYear: string;

  @IsOptional()
  @IsYear()
  dateToYear: string;

  @IsBoolean()
  @Transform(({ value }) => {
    if (value !== undefined || value !== 'false' || value !== 'true') {
      throw new HttpException('must be true or false', 400);
    }
    return value === 'false' ? false : true;
  })
  @IsOptional()
  access: boolean;

  @IsBoolean()
  @Transform(({ value }) => {
    if (value !== undefined || value !== 'false' || value !== 'true') {
      throw new HttpException('must be true or false', 400);
    }
    return value === 'false' ? false : true;
  })
  @IsOptional()
  hidden: boolean;
}

export function IsYear(validationOptions?: ValidationOptions) {
  const dateTimeFormatRegex = /^\d{4}$/;

  return Matches(dateTimeFormatRegex, {
    message: 'year must be YYYY format',
    ...validationOptions,
  });
}
