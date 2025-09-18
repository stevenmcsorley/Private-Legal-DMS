import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Matter } from './matter.entity';
import { Firm } from './firm.entity';
import { User } from './user.entity';

export enum ShareRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  COLLABORATOR = 'collaborator',
  PARTNER_LEAD = 'partner_lead',
}

export enum ShareStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('matter_shares')
@Index(['matter_id', 'shared_with_firm'], { unique: true })
@Index(['matter_id', 'expires_at'])
@Index(['shared_with_firm', 'status'])
export class MatterShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  matter_id: string;

  @Column('uuid')
  shared_by_firm_id: string;

  @Column('uuid')
  shared_with_firm: string;

  @Column('uuid')
  shared_by_user_id: string;

  @Column({
    type: 'enum',
    enum: ShareRole,
    default: ShareRole.VIEWER,
  })
  role: ShareRole;

  @Column({
    type: 'enum',
    enum: ShareStatus,
    default: ShareStatus.PENDING,
  })
  status: ShareStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  accepted_at: Date;

  @Column('uuid', { nullable: true })
  accepted_by_user_id: string;

  @Column({ type: 'text', nullable: true })
  invitation_message: string;

  @Column({ type: 'jsonb', default: '{}' })
  permissions: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  restrictions: Record<string, any>;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Matter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matter_id' })
  matter: Matter;

  @ManyToOne(() => Firm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_by_firm_id' })
  shared_by_firm: Firm;

  @ManyToOne(() => Firm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_with_firm' })
  shared_with_firm_entity: Firm;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_by_user_id' })
  shared_by_user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'accepted_by_user_id' })
  accepted_by_user: User;

  // Helper methods
  isExpired(): boolean {
    return this.expires_at && new Date() > this.expires_at;
  }

  isActive(): boolean {
    return this.status === ShareStatus.ACCEPTED && !this.isExpired();
  }

  isPending(): boolean {
    return this.status === ShareStatus.PENDING;
  }

  canPerformAction(action: string): boolean {
    if (!this.isActive()) return false;

    return this.permissions[action] === true;
  }
}