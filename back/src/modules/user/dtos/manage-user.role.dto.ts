import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { UserRole } from 'src/typeorm/entitys/user.entity';

export enum Actions {
  ADD = 'add',
  REMOVE = 'remove',
}

export class ManageRoleDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @IsEnum(Actions)
  action: Actions;
}
