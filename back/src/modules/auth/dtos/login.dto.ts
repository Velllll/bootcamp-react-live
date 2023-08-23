import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto extends LoginDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
