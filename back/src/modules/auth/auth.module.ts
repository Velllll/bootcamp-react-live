import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from './token/token.module';
import entities from 'src/typeorm/entities';
import { GuardsModule } from 'src/guards/guards.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [TypeOrmModule.forFeature(entities), TokenModule, GuardsModule],
})
export class AuthModule {}
