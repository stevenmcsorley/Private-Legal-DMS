import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LegalHold } from './legal-hold.entity';
import { User } from './user.entity';

export enum CustodianStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  RELEASED = 'released',
}

@Entity('legal_hold_custodians')
export class LegalHoldCustodian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  legal_hold_id: string;

  @Column('uuid')
  custodian_id: string;

  @Column({
    type: 'enum',
    enum: CustodianStatus,
    default: CustodianStatus.PENDING,
  })
  status: CustodianStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  notice_sent_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  acknowledged_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  compliance_checked_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  released_at: Date;

  @Column({ type: 'text', nullable: true })
  acknowledgment_method: string;

  @Column({ type: 'text', nullable: true })
  non_compliance_reason: string;

  @Column({ type: 'jsonb', nullable: true })
  custodian_metadata: Record<string, any>;

  @Column('uuid', { nullable: true })
  assigned_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => LegalHold, legalHold => legalHold.custodians, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'legal_hold_id' })
  legal_hold: LegalHold;

  @ManyToOne(() => User, user => user.custodian_assignments)
  @JoinColumn({ name: 'custodian_id' })
  custodian: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_by' })
  assigned_by_user: User;
}