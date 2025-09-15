import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Matter } from './matter.entity';
import { User } from './user.entity';

export enum MatterRole {
  LEAD_LAWYER = 'lead_lawyer',
  ASSOCIATE = 'associate',
  PARALEGAL = 'paralegal',
  LEGAL_ASSISTANT = 'legal_assistant',
  OBSERVER = 'observer',
}

export enum AccessLevel {
  FULL = 'full',
  READ_WRITE = 'read_write',
  READ_ONLY = 'read_only',
  LIMITED = 'limited',
}

@Entity('matter_teams')
@Unique(['matter_id', 'user_id'])
export class MatterTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  matter_id: string;

  @Column('uuid')
  user_id: string;

  @Column({
    type: 'enum',
    enum: MatterRole,
    default: MatterRole.OBSERVER,
  })
  role: MatterRole;

  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.READ_ONLY,
  })
  access_level: AccessLevel;

  @CreateDateColumn()
  added_at: Date;

  @Column('uuid')
  added_by: string;

  // Relations
  @ManyToOne(() => Matter, matter => matter.team_members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matter_id' })
  matter: Matter;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'added_by' })
  added_by_user: User;
}