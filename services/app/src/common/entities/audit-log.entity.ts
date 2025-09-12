import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('audits')
@Index(['firm_id', 'timestamp'])
@Index(['user_id', 'timestamp'])
@Index(['resource_type', 'timestamp'])
@Index(['action', 'timestamp'])
@Index(['risk_level', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  firm_id: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 50 })
  resource_type: string;

  @Column({ type: 'varchar', length: 100 })
  resource_id: string;

  @Column({ type: 'jsonb', default: {} })
  details: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ 
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  })
  risk_level: 'low' | 'medium' | 'high' | 'critical';

  @Column({ 
    type: 'enum',
    enum: ['success', 'failure', 'partial'],
    default: 'success'
  })
  outcome: 'success' | 'failure' | 'partial';

  @CreateDateColumn()
  timestamp: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}