import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles, User } from 'src/typeorm/entitys/user.entity';
import { GuardsModule } from 'src/guards/guards.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [TypeOrmModule.forFeature([User, Roles]), GuardsModule],
  exports: [UserService],
})
export class UserModule {}
