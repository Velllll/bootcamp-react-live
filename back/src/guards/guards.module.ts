import { Module } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/typeorm/entities';
import { AccessGuard } from './access/access.guard';

@Module({
  providers: [AuthGuard, AccessGuard],
  exports: [AuthGuard, AccessGuard, JwtModule],
  imports: [JwtModule.register({}), TypeOrmModule.forFeature(entities)],
})
export class GuardsModule {}
