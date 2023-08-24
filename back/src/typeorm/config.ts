import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import entities from './entities';
import { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } from 'src/config';

const configService: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: entities,
};

export { configService };
