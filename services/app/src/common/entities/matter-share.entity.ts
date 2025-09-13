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
@Index(['shared_with_firm'])
export class MatterShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  matter_id: string;

  @Column('uuid', { name: 'shared_with_firm' })
  shared_with_firm: string;

  @Column('uuid', { name: 'shared_by' })
  shared_by: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'viewer',
  })
  role: string;

  @Column({ type: 'text', array: true, default: [] })
  permissions: string[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  expires_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  revoked_at: Date;

  @Column('uuid', { nullable: true })
  revoked_by: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Matter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matter_id' })
  matter: Matter;

  @ManyToOne(() => Firm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_with_firm' })
  shared_with_firm_entity: Firm;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_by' })
  shared_by_user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'revoked_by' })
  revoked_by_user: User;

  // Helper methods
  isExpired(): boolean {
    return this.expires_at && new Date() > this.expires_at;
  }

  isRevoked(): boolean {
    return !!this.revoked_at;
  }

  isActive(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  canPerformAction(action: string): boolean {
    if (!this.isActive()) return false;

    return this.permissions.includes(action);
  }
}