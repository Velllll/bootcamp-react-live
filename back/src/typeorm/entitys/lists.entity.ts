import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FacultyList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

@Entity()
export class JobList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

@Entity()
export class ScienceCentreList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
