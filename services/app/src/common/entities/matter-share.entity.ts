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
@Index(['matter_id', 'shared_with_firm_id'], { unique: true })
@Index(['matter_id', 'expires_at'])
@Index(['shared_with_firm_id', 'status'])
export class MatterShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  matter_id: string;

  @Column('uuid') 
  shared_by_firm_id: string;

  @Column('uuid')
  shared_with_firm_id: string;

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

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  accepted_at: Date;

  @Column('uuid', { nullable: true })
  accepted_by_user_id: string;

  @Column({ type: 'text', nullable: true })
  invitation_message: string;

  @Column({ type: 'jsonb', default: {} })
  permissions: {
    can_download?: boolean;
    can_upload?: boolean;
    can_comment?: boolean;
    can_view_audit?: boolean;
    watermark_required?: boolean;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  restrictions: {
    allowed_document_types?: string[];
    max_download_count?: number;
    ip_whitelist?: string[];
    time_restrictions?: {
      start_time?: string;
      end_time?: string;
      timezone?: string;
    };
    [key: string]: any;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Matter, matter => matter.shares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matter_id' })
  matter: Matter;

  @ManyToOne(() => Firm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_by_firm_id' })
  shared_by_firm: Firm;

  @ManyToOne(() => Firm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_with_firm_id' })
  shared_with_firm: Firm;

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

  canPerformAction(action: string): boolean {
    if (!this.isActive()) return false;

    switch (action) {
      case 'download':
        return this.permissions.can_download !== false;
      case 'upload':
        return this.permissions.can_upload === true;
      case 'comment':
        return this.permissions.can_comment !== false;
      case 'view_audit':
        return this.permissions.can_view_audit === true;
      default:
        return false;
    }
  }
}