import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Firm } from './firm.entity';
import { Team } from './team.entity';
import { LegalHold } from './legal-hold.entity';
import { LegalHoldCustodian } from './legal-hold-custodian.entity';
import { Document } from './document.entity';
import { Matter } from './matter.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  firm_id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  display_name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  keycloak_id: string;

  @Column({ type: 'text', array: true, default: '{}' })
  roles: string[];

  @Column({ type: 'jsonb', default: {} })
  attributes: Record<string, any>;

  @Column({ type: 'int', default: 5 })
  clearance_level: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Firm, firm => firm.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firm_id' })
  firm: Firm;

  @ManyToMany(() => Team, team => team.members)
  teams: Team[];

  @OneToMany(() => Document, document => document.created_by_user)
  created_documents: Document[];

  @OneToMany(() => Matter, matter => matter.created_by_user)
  created_matters: Matter[];

  // Note: Circular import handled via string reference
  // @OneToMany(() => MatterTeam, matterTeam => matterTeam.user)
  // matter_teams: MatterTeam[];

  @OneToMany(() => LegalHold, legalHold => legalHold.created_by_user)
  created_legal_holds: LegalHold[];

  @OneToMany(() => LegalHold, legalHold => legalHold.released_by_user)
  released_legal_holds: LegalHold[];

  @OneToMany(() => LegalHoldCustodian, custodian => custodian.custodian)
  custodian_assignments: LegalHoldCustodian[];
}