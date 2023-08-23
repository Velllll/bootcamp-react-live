import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'User',
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

  @OneToMany(() => Roles, (roles) => roles.role)
  role: Roles[];
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

  @ManyToOne(() => User, (user) => user.role)
  user: User;
}
