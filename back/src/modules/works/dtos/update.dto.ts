import { HttpException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateWorkDto {
  @IsNumber()
  @IsNotEmpty()
  workid: number;

  @IsBoolean()
  @IsOptional()
  hidden: boolean;

  @IsOptional()
  @IsString()
  displayName: string;

  @IsOptional()
  @IsEnum(['Q1', 'Q2', 'Q3', 'Q4', null], {
    message: 'must be Q1, Q2, Q3, Q4 or null',
  })
  @Transform(({ value }) => {
    if (value !== null && value !== undefined) {
      return value;
    }
    return null;
  })
  hIndex: string | null;
}
