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
import { Client } from './client.entity';
import { User } from './user.entity';
import { Document } from './document.entity';

export enum MatterStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

@Entity('matters')
export class Matter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  firm_id: string;

  @Column('uuid')
  client_id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MatterStatus,
    default: MatterStatus.ACTIVE,
  })
  status: MatterStatus;

  @Column({ type: 'int', default: 1 })
  security_class: number;

  @Column('uuid')
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Firm, firm => firm.matters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firm_id' })
  firm: Firm;

  @ManyToOne(() => Client, client => client.matters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => User, user => user.created_matters)
  @JoinColumn({ name: 'created_by' })
  created_by_user: User;

  @OneToMany(() => Document, document => document.matter)
  documents: Document[];
}