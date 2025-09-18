import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Client } from './client.entity';
import { Matter } from './matter.entity';
import { Document } from './document.entity';
import { RetentionClass } from './retention-class.entity';
import { LegalHold } from './legal-hold.entity';

@Entity('firms')
export class Firm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  external_ref: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @OneToMany(() => User, user => user.firm)
  users: User[];

  @OneToMany(() => Client, client => client.firm)
  clients: Client[];

  @OneToMany(() => Matter, matter => matter.firm)
  matters: Matter[];

  @OneToMany(() => Document, document => document.firm)
  documents: Document[];

  @OneToMany(() => RetentionClass, retentionClass => retentionClass.firm)
  retention_classes: RetentionClass[];

  @OneToMany(() => LegalHold, legalHold => legalHold.firm)
  legal_holds: LegalHold[];
}