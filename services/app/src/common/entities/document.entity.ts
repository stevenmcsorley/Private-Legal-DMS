import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Firm } from './firm.entity';
import { Client } from './client.entity';
import { Matter } from './matter.entity';
import { User } from './user.entity';
import { RetentionClass } from './retention-class.entity';
import { DocumentMeta } from './document-meta.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  matter_id: string;

  @Column('uuid')
  firm_id: string;

  @Column('uuid', { nullable: true })
  client_id: string;

  @Column({ type: 'varchar', length: 500 })
  object_key: string;

  @Column({ type: 'varchar', length: 64 })
  content_sha256: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  original_filename: string;

  @Column({ type: 'bigint' })
  size_bytes: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mime_type: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column('uuid', { nullable: true })
  parent_document_id: string;

  @Column('uuid', { nullable: true })
  retention_class_id: string;

  @Column({ type: 'boolean', default: false })
  legal_hold: boolean;

  @Column({ type: 'text', nullable: true })
  legal_hold_reason: string;

  @Column('uuid', { nullable: true })
  legal_hold_set_by: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  legal_hold_set_at: Date;

  @Column('uuid')
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  deleted_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  // Relations
  @ManyToOne(() => Firm, firm => firm.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firm_id' })
  firm: Firm;

  @ManyToOne(() => Client, client => client.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Matter, matter => matter.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matter_id' })
  matter: Matter;

  @ManyToOne(() => User, user => user.created_documents)
  @JoinColumn({ name: 'created_by' })
  created_by_user: User;

  @ManyToOne(() => RetentionClass, retentionClass => retentionClass.documents)
  @JoinColumn({ name: 'retention_class_id' })
  retention_class: RetentionClass;

  @ManyToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'parent_document_id' })
  parent_document: Document;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'legal_hold_set_by' })
  legal_hold_set_by_user: User;

  @OneToOne(() => DocumentMeta, documentMeta => documentMeta.document, { cascade: true })
  metadata: DocumentMeta;
}