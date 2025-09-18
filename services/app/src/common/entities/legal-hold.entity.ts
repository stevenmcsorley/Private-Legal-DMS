import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Matter } from './matter.entity';
import { User } from './user.entity';
import { Firm } from './firm.entity';
import { Document } from './document.entity';
import { LegalHoldCustodian } from './legal-hold-custodian.entity';

export type LegalHoldStatus = 'active' | 'released' | 'expired';
export type LegalHoldType = 'litigation' | 'investigation' | 'audit' | 'regulatory' | 'other';

@Entity('legal_holds')
export class LegalHold {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: ['litigation', 'investigation', 'audit', 'regulatory', 'other'],
    default: 'litigation',
  })
  type: LegalHoldType;

  @Column({
    type: 'enum',
    enum: ['active', 'released', 'expired'],
    default: 'active',
  })
  status: LegalHoldStatus;

  @Column('uuid')
  firm_id: string;

  @Column('uuid', { nullable: true })
  matter_id: string;

  @Column('uuid')
  created_by: string;

  @Column('uuid', { nullable: true })
  released_by: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  released_at: Date;

  @Column({ type: 'text', nullable: true })
  release_reason: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiry_date: Date;

  @Column({ type: 'boolean', default: true })
  auto_apply_to_new_documents: boolean;

  @Column({ type: 'text', nullable: true })
  custodian_instructions: string;

  @Column({ type: 'json', nullable: true })
  notification_settings: {
    email_custodians?: boolean;
    email_legal_team?: boolean;
    reminder_frequency?: 'weekly' | 'monthly' | 'quarterly';
    escalation_days?: number;
  };

  @Column({ type: 'json', nullable: true })
  search_criteria: {
    keywords?: string[];
    date_range?: {
      start?: string;
      end?: string;
    };
    document_types?: string[];
    custodians?: string[];
    matters?: string[];
  };

  @Column({ type: 'int', default: 0 })
  documents_count: number;

  @Column({ type: 'int', default: 0 })
  custodians_count: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_notification_sent: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Firm, firm => firm.legal_holds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firm_id' })
  firm: Firm;

  @ManyToOne(() => Matter, matter => matter.legal_holds, { nullable: true })
  @JoinColumn({ name: 'matter_id' })
  matter: Matter;

  @ManyToOne(() => User, user => user.created_legal_holds)
  @JoinColumn({ name: 'created_by' })
  created_by_user: User;

  @ManyToOne(() => User, user => user.released_legal_holds, { nullable: true })
  @JoinColumn({ name: 'released_by' })
  released_by_user: User;

  @OneToMany(() => Document, document => document.legal_hold_ref)
  documents: Document[];

  @OneToMany(() => LegalHoldCustodian, custodian => custodian.legal_hold, { cascade: true })
  custodians: LegalHoldCustodian[];
}