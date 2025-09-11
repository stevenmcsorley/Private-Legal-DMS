import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Firm } from './firm.entity';
import { Document } from './document.entity';

@Entity('retention_classes')
export class RetentionClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  firm_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  retention_years: number;

  @Column({ type: 'boolean', default: false })
  legal_hold_override: boolean;

  @Column({ type: 'boolean', default: false })
  auto_delete: boolean;

  @Column({ type: 'jsonb', nullable: true })
  minio_policy: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Firm, firm => firm.retention_classes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firm_id' })
  firm: Firm;

  @OneToMany(() => Document, document => document.retention_class)
  documents: Document[];
}