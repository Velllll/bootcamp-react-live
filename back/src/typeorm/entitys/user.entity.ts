import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToMany(() => Roles, (roles) => roles.user)
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
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
