import { Module } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/typeorm/entities';
import { RoleGuard } from './role /role.guard';

@Module({
  providers: [AuthGuard, RoleGuard],
  exports: [AuthGuard, RoleGuard, JwtModule],
  imports: [JwtModule.register({}), TypeOrmModule.forFeature(entities)],
})
export class GuardsModule {}
