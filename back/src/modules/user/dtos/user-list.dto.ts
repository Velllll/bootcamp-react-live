import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/typeorm/entitys/user.entity';

export class QueriesForListOfUsers {
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
  login: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}
