import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './typeorm/config';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { OpenAlexModule } from './modules/download-works-modules/open-alex/open-alex.module';
import { ScimagojrModule } from './modules/download-works-modules/scimagojr/scimagojr.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoaderModule } from './modules/loader/loader.module';
import { WorksModule } from './modules/works/works.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(configService),
    OpenAlexModule,
    ScimagojrModule,
    ScheduleModule.forRoot(),
    LoaderModule,
    AuthModule,
    AuthModule,
    WorksModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
