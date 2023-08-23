import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum ListType {
  FACULTY = 'faculty',
  JOB = 'job',
  SCIENCE_CENTRE = 'scienceCentre',
}

export class ListTypesDto {
  @IsEnum(ListType, { each: true })
  @IsNotEmpty()
  type: ListType[];
}

export class ListTypeDto {
  @IsEnum(ListType)
  @IsNotEmpty()
  type: ListType;
}

export class ListDto extends ListTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class DeleteList extends ListTypeDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class UpdateList extends DeleteList {
  @IsString()
  @IsNotEmpty()
  name: string;
}
