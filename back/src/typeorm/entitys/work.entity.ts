import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserWorkCollection } from './user-work-collection.entity';

@Entity()
export class Biblio {
  @PrimaryGeneratedColumn()
  biblioid: number;

  @Column({
    nullable: true,
  })
  firstPage?: string;

  @Column({
    nullable: true,
  })
  issue?: string;

  @Column({
    nullable: true,
  })
  lastPage?: string;

  @Column({
    nullable: true,
  })
  volume?: string;
}

@Entity()
export class OpenAccess {
  @PrimaryGeneratedColumn()
  openaccessid: number;

  @Column({
    nullable: true,
  })
  is_oa?: boolean;

  @Column({
    nullable: true,
  })
  oa_status?: string;

  @Column({
    nullable: true,
  })
  oa_url?: string;
}

@Entity()
export class PrimaryLocation {
  @PrimaryGeneratedColumn()
  primarylocationid: number;

  @Column({
    nullable: true,
  })
  is_oa: boolean;

  @Column({
    nullable: true,
  })
  landing_page_url?: string;

  @Column({
    nullable: true,
  })
  jornalName: string;

  @Column('text', { array: true, nullable: true })
  issn?: string[];
}

@Entity()
export class Work {
  @PrimaryGeneratedColumn()
  workid: number;

  @OneToMany(() => Authorships, (authorships) => authorships.work, {
    cascade: true,
  })
  authorships: Authorships[];

  @OneToOne(() => Biblio)
  @JoinColumn()
  biblio: Biblio;

  @Column({
    nullable: true,
  })
  cited_by_count?: number;

  @OneToMany(() => Concept, (concept) => concept.work, {
    cascade: true,
  })
  @JoinColumn()
  concepts: Concept[];

  @Column({
    nullable: true,
  })
  displayName: string;

  @Column({
    nullable: true,
  })
  doi?: string;

  @Column({
    nullable: true,
  })
  language?: string;

  @OneToOne(() => OpenAccess)
  @JoinColumn()
  openAccess: OpenAccess;

  @OneToOne(() => PrimaryLocation)
  @JoinColumn()
  primaryLocation: PrimaryLocation;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  publication_date?: Date;

  @Column({
    nullable: true,
  })
  type?: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  @Column({
    nullable: true,
  })
  hIndex?: string;

  @Column({
    nullable: false,
    default: false,
  })
  hidden: boolean;

  @Column({
    nullable: true,
  })
  lastUpdateBy: number;

  @OneToMany(
    () => UserWorkCollection,
    (userWorkCollection) => userWorkCollection.work,
    {
      cascade: true,
    },
  )
  userWorkCollection: UserWorkCollection[];
}

@Entity()
export class Authorships {
  @PrimaryGeneratedColumn()
  authorid: number;

  @Column({
    nullable: true,
  })
  authorOpenAlexId?: string;

  @Column({
    nullable: true,
  })
  displayName?: string;

  @Column({
    nullable: true,
  })
  orcid?: string;

  @Column({
    nullable: true,
  })
  authorPosition?: string;

  @Column({
    nullable: true,
  })
  institutionsId?: string;

  @Column({
    nullable: true,
  })
  institutionName?: string;

  @ManyToOne(() => Work, (work) => work.authorships)
  work?: Work;
}

@Entity()
export class Concept {
  @PrimaryGeneratedColumn()
  conceptid: number;

  @Column({
    nullable: true,
  })
  conceptName?: string;

  @ManyToOne(() => Work, (work) => work.concepts)
  work: Work;
}
