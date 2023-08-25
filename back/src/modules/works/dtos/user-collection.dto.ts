import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserColectionDto {
  @IsNotEmpty()
  @IsNumber()
  workid: number;
}
