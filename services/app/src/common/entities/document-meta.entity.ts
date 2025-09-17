import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Document } from './document.entity';

@Entity('document_meta')
export class DocumentMeta {
  @PrimaryColumn('uuid')
  document_id: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  parties: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  jurisdiction: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  document_type: string;

  @Column({ type: 'date', nullable: true })
  document_date: Date;

  @Column({ type: 'date', nullable: true })
  effective_date: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ type: 'boolean', default: false })
  confidential: boolean;

  @Column({ type: 'boolean', default: false })
  privileged: boolean;

  @Column({ type: 'boolean', default: false })
  work_product: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  custom_fields: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  extracted_text: string;

  @Column({ type: 'integer', nullable: true })
  pages: number;

  @Column({ type: 'tsvector', nullable: true })
  search_vector: string;

  // Relations
  @OneToOne(() => Document, document => document.metadata, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;
}