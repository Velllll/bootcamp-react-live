import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Work } from './work.entity';
import { User } from './user.entity';

@Entity()
export class UserWorkCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Work, (work) => work.userWorkCollection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'work_id',
  })
  work: Work;

  @ManyToOne(() => User, (user) => user.userWorkCollection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
