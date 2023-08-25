import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserWorkCollection } from './user-work-collection.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: false,
  })
  password: string;

  @Column({
    nullable: true,
  })
  refreshToken: string;

  @OneToMany(() => Roles, (roles) => roles.user, {
    cascade: true,
  })
  role: Roles[];

  @OneToMany(
    () => UserWorkCollection,
    (userWorkCollection) => userWorkCollection.user,
  )
  userWorkCollection: UserWorkCollection[];
}

@Entity()
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    enum: UserRole,
  })
  role: UserRole;

  @ManyToOne(() => User, (user) => user.role, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
